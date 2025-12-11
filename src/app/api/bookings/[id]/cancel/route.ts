import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, studioInfo, studentPurchases, classTypes, instructors, userProfiles, user, waitlist } from '@/db/schema';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { sendCancellationConfirmation, sendInstructorNotification, sendAdminNotification, sendWaitlistNotification } from '@/app/actions/send-booking-emails';
import { asc, sql } from 'drizzle-orm';

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

    // Fetch studio info for cancellation policy (with fallback defaults)
    const studioInfoResult = await db.select().from(studioInfo).limit(1);

    // Use fallback defaults if studio info not configured
    const studio = studioInfoResult[0] || {
      cancellationWindowHours: 24,
      lateCancelPenalty: 'lose_credit',
      noShowPenalty: 'lose_credit',
      cancellationPolicyText: 'Please cancel at least 24 hours in advance to receive a credit refund.'
    };
    const cancellationWindowHours = studio.cancellationWindowHours || 24;

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

    // Send email notifications asynchronously (don't block the response)
    sendCancellationEmails(
      bookingId,
      booking.studentProfileId,
      classData,
      cancellationType,
      shouldRefundCredits ? (booking.creditsUsed || 0) : 0,
      hoursUntilClass
    ).catch(error => {
      console.error('Failed to send cancellation email notifications:', error);
    });

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

// Helper function to send cancellation email notifications
async function sendCancellationEmails(
  bookingId: number,
  studentProfileId: number,
  classData: { id: number; date: string; startTime: string; classTypeId: number; instructorId: number; capacity: number },
  cancellationType: 'on_time' | 'late' | 'no_show',
  creditsRefunded: number,
  hoursUntilClass: number
) {
  try {
    // Fetch student data
    const studentData = await db
      .select({
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(userProfiles.id, studentProfileId))
      .limit(1);

    if (studentData.length === 0) {
      console.error('Student data not found for cancellation email');
      return;
    }

    // Fetch class type name
    const classTypeData = await db
      .select({ name: classTypes.name })
      .from(classTypes)
      .where(eq(classTypes.id, classData.classTypeId))
      .limit(1);

    // Fetch instructor data
    const instructorData = await db
      .select({
        instructorName: user.name,
        instructorEmail: user.email,
      })
      .from(instructors)
      .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(instructors.id, classData.instructorId))
      .limit(1);

    const student = studentData[0];
    const className = classTypeData[0]?.name || 'Class';
    const instructor = instructorData[0];

    // Format date
    const classDate = new Date(classData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 1. Send cancellation confirmation to student
    await sendCancellationConfirmation({
      studentEmail: student.studentEmail,
      studentName: student.studentName,
      className,
      classDate,
      classTime: classData.startTime,
      instructorName: instructor?.instructorName || 'Instructor',
      cancellationType,
      creditsRefunded,
      hoursUntilClass: Math.max(0, hoursUntilClass),
    });

    // 2. Send notification to instructor
    if (instructor) {
      // Get current booking count for capacity info
      const currentBookingsResult = await db
        .select({ count: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.classId, classData.id),
            eq(bookings.bookingStatus, 'confirmed')
          )
        );

      await sendInstructorNotification({
        instructorEmail: instructor.instructorEmail,
        instructorName: instructor.instructorName,
        studentName: student.studentName,
        className,
        classDate,
        classTime: classData.startTime,
        currentCapacity: currentBookingsResult.length,
        maxCapacity: classData.capacity,
        bookingId,
        notificationType: 'cancellation',
      });
    }

    // 3. Send notification to admin
    await sendAdminNotification({
      notificationType: 'cancellation',
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      className,
      classDate,
      classTime: classData.startTime,
      instructorName: instructor?.instructorName || 'Instructor',
      bookingId,
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    // 4. Notify waitlisted students that a spot opened up
    await notifyWaitlistedStudents(
      classData.id,
      className,
      classDate,
      classData.startTime,
      instructor?.instructorName || 'Instructor',
      classData.capacity
    );

    console.log('Cancellation email notifications sent successfully for booking:', bookingId);
  } catch (error) {
    console.error('Error sending cancellation email notifications:', error);
  }
}

// Helper function to notify waitlisted students when a spot opens
async function notifyWaitlistedStudents(
  classId: number,
  className: string,
  classDate: string,
  classTime: string,
  instructorName: string,
  classCapacity: number
) {
  try {
    // Get current confirmed booking count
    const confirmedBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, classId),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    const currentBookings = Number(confirmedBookings[0]?.count || 0);
    const spotsAvailable = classCapacity - currentBookings;

    // Only notify if there are spots available
    if (spotsAvailable <= 0) {
      return;
    }

    // Get waitlisted students for this class (ordered by position)
    const waitlistedStudents = await db
      .select({
        waitlistId: waitlist.id,
        position: waitlist.position,
        notified: waitlist.notified,
        studentProfileId: waitlist.studentProfileId,
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(waitlist)
      .innerJoin(userProfiles, eq(waitlist.studentProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(waitlist.classId, classId))
      .orderBy(asc(waitlist.position))
      .limit(5); // Notify top 5 on waitlist

    if (waitlistedStudents.length === 0) {
      console.log('No students on waitlist for class:', classId);
      return;
    }

    // Send notification to each waitlisted student
    for (const waitlistEntry of waitlistedStudents) {
      try {
        await sendWaitlistNotification({
          studentEmail: waitlistEntry.studentEmail,
          studentName: waitlistEntry.studentName,
          className,
          classDate,
          classTime,
          instructorName,
          waitlistPosition: waitlistEntry.position,
          spotsAvailable,
        });

        // Mark as notified
        await db
          .update(waitlist)
          .set({ notified: true })
          .where(eq(waitlist.id, waitlistEntry.waitlistId));

        console.log(`Waitlist notification sent to ${waitlistEntry.studentEmail} (position ${waitlistEntry.position})`);
      } catch (error) {
        console.error(`Failed to notify waitlist position ${waitlistEntry.position}:`, error);
      }
    }
  } catch (error) {
    console.error('Error notifying waitlisted students:', error);
  }
}