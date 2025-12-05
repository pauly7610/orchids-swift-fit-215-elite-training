import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, studioInfo, studentPurchases } from '@/db/schema';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `booking-cancel:${clientId}`,
      RATE_LIMITS.BOOKING_CANCEL
    );

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset).toISOString();
      return NextResponse.json(
        {
          error: 'Too many cancellation requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
          resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid booking ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id);

    // Fetch the booking
    const bookingResult = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const booking = bookingResult[0];

    // Check if booking is already cancelled
    if (
      booking.bookingStatus === 'cancelled' ||
      booking.bookingStatus === 'no_show' ||
      booking.bookingStatus === 'late_cancel'
    ) {
      return NextResponse.json(
        {
          error: 'Booking is already cancelled',
          code: 'ALREADY_CANCELLED',
          currentStatus: booking.bookingStatus,
        },
        { status: 400 }
      );
    }

    // Only allow cancellation if status is confirmed
    if (booking.bookingStatus !== 'confirmed') {
      return NextResponse.json(
        {
          error: 'Only confirmed bookings can be cancelled',
          code: 'INVALID_BOOKING_STATUS',
          currentStatus: booking.bookingStatus,
        },
        { status: 400 }
      );
    }

    // Fetch the related class
    const classResult = await db
      .select()
      .from(classes)
      .where(eq(classes.id, booking.classId))
      .limit(1);

    if (classResult.length === 0) {
      return NextResponse.json(
        { error: 'Related class not found', code: 'CLASS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const classData = classResult[0];

    // Fetch studio info for cancellation policy
    const studioInfoResult = await db.select().from(studioInfo).limit(1);

    if (studioInfoResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Studio information not configured',
          code: 'STUDIO_INFO_MISSING',
        },
        { status: 500 }
      );
    }

    const studio = studioInfoResult[0];
    const cancellationWindowHours = studio.cancellationWindowHours;

    // Calculate hours until class starts
    const classDateTime = new Date(`${classData.date}T${classData.startTime}`);
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Determine cancellation type
    let cancellationType: 'on_time' | 'late' | 'no_show';
    let newBookingStatus: string;
    let penaltyInfo: string | null = null;
    let shouldRefundCredits = false;

    if (hoursUntilClass < 0) {
      // Class has already started or passed
      cancellationType = 'no_show';
      newBookingStatus = 'no_show';
      penaltyInfo = studio.noShowPenalty || 'lose_credit';
      shouldRefundCredits = false;
    } else if (hoursUntilClass < cancellationWindowHours) {
      // Within cancellation window (late cancel)
      cancellationType = 'late';
      newBookingStatus = 'late_cancel';
      penaltyInfo = studio.lateCancelPenalty || 'lose_credit';
      shouldRefundCredits = false;
    } else {
      // Outside cancellation window (on time)
      cancellationType = 'on_time';
      newBookingStatus = 'cancelled';
      penaltyInfo = null; // No penalty for on-time cancellation
      shouldRefundCredits = true;
    }

    // Execute cancellation and credit refund in a transaction
    const result = await db.transaction(async (tx) => {
      // Update the booking
      const updatedBooking = await tx
        .update(bookings)
        .set({
          bookingStatus: newBookingStatus,
          cancelledAt: new Date().toISOString(),
          cancellationType: cancellationType,
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      if (updatedBooking.length === 0) {
        throw new Error('Failed to update booking');
      }

      // Refund credits if on-time cancellation and credits were used
      if (shouldRefundCredits && booking.creditsUsed && booking.creditsUsed > 0) {
        const currentDate = new Date().toISOString();
        
        // Find the most recent active purchase to refund to
        // Prioritize the one with the furthest expiration date
        const activePurchases = await tx
          .select()
          .from(studentPurchases)
          .where(
            and(
              eq(studentPurchases.studentProfileId, booking.studentProfileId),
              eq(studentPurchases.isActive, true),
              or(
                isNull(studentPurchases.expiresAt),
                gt(studentPurchases.expiresAt, currentDate)
              )
            )
          )
          .orderBy(studentPurchases.expiresAt); // Refund to the one expiring soonest first

        if (activePurchases.length > 0) {
          // Refund to the first active purchase
          const purchaseToRefund = activePurchases[0];
          const newCredits = (purchaseToRefund.creditsRemaining || 0) + booking.creditsUsed;

          await tx
            .update(studentPurchases)
            .set({
              creditsRemaining: newCredits,
              isActive: true, // Ensure it's active since we're adding credits
            })
            .where(eq(studentPurchases.id, purchaseToRefund.id));
        } else {
          // No active purchase found - log warning but don't fail the cancellation
          console.warn(
            `No active purchase found to refund ${booking.creditsUsed} credits for booking ${bookingId}`
          );
        }
      }

      return updatedBooking[0];
    });

    // Prepare response with cancellation details
    const response = {
      booking: result,
      cancellationDetails: {
        cancellationType,
        hoursUntilClass: Math.max(0, hoursUntilClass),
        cancellationWindowHours,
        penalty: penaltyInfo,
        creditsRefunded: shouldRefundCredits ? booking.creditsUsed : 0,
        classDateTime: classDateTime.toISOString(),
        cancelledAt: result.cancelledAt,
      },
      message:
        cancellationType === 'on_time'
          ? `Booking cancelled successfully. ${booking.creditsUsed || 0} credit(s) refunded.`
          : cancellationType === 'late'
            ? `Late cancellation recorded. Penalty: ${penaltyInfo}. No credits refunded.`
            : `No-show recorded. Penalty: ${penaltyInfo}. No credits refunded.`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('POST cancellation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}