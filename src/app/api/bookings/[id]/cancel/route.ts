import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, studioInfo } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    if (hoursUntilClass < 0) {
      // Class has already started or passed
      cancellationType = 'no_show';
      newBookingStatus = 'no_show';
      penaltyInfo = studio.noShowPenalty || 'lose_credit';
    } else if (hoursUntilClass < cancellationWindowHours) {
      // Within cancellation window (late cancel)
      cancellationType = 'late';
      newBookingStatus = 'late_cancel';
      penaltyInfo = studio.lateCancelPenalty || 'lose_credit';
    } else {
      // Outside cancellation window (on time)
      cancellationType = 'on_time';
      newBookingStatus = 'cancelled';
      penaltyInfo = null; // No penalty for on-time cancellation
    }

    // Update the booking
    const updatedBooking = await db
      .update(bookings)
      .set({
        bookingStatus: newBookingStatus,
        cancelledAt: new Date().toISOString(),
        cancellationType: cancellationType,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update booking', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Prepare response with cancellation details
    const response = {
      booking: updatedBooking[0],
      cancellationDetails: {
        cancellationType,
        hoursUntilClass: Math.max(0, hoursUntilClass),
        cancellationWindowHours,
        penalty: penaltyInfo,
        classDateTime: classDateTime.toISOString(),
        cancelledAt: updatedBooking[0].cancelledAt,
      },
      message:
        cancellationType === 'on_time'
          ? 'Booking cancelled successfully. No penalty applied.'
          : cancellationType === 'late'
            ? `Late cancellation recorded. Penalty: ${penaltyInfo}`
            : `No-show recorded. Penalty: ${penaltyInfo}`,
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