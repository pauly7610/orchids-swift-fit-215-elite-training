import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, classTypes, instructors, userProfiles, user, studioInfo } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sendBookingConfirmation, sendInstructorNotification, sendAdminNotification } from '@/app/actions/send-booking-emails';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // List with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentProfileId = searchParams.get('studentProfileId');
    const classId = searchParams.get('classId');
    const bookingStatus = searchParams.get('bookingStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select().from(bookings);

    const conditions = [];

    if (studentProfileId) {
      const profileId = parseInt(studentProfileId);
      if (!isNaN(profileId)) {
        conditions.push(eq(bookings.studentProfileId, profileId));
      }
    }

    if (classId) {
      const cId = parseInt(classId);
      if (!isNaN(cId)) {
        conditions.push(eq(bookings.classId, cId));
      }
    }

    if (bookingStatus) {
      const validStatuses = ['confirmed', 'cancelled', 'no_show', 'late_cancel'];
      if (validStatuses.includes(bookingStatus)) {
        conditions.push(eq(bookings.bookingStatus, bookingStatus));
      }
    }

    if (startDate) {
      conditions.push(gte(bookings.bookedAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(bookings.bookedAt, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, studentProfileId, bookingStatus, cancelledAt, cancellationType, paymentId, creditsUsed } = body;

    // Validate required fields
    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required', code: 'MISSING_CLASS_ID' },
        { status: 400 }
      );
    }

    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required', code: 'MISSING_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate field types
    if (isNaN(parseInt(classId))) {
      return NextResponse.json(
        { error: 'classId must be a valid integer', code: 'INVALID_CLASS_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(studentProfileId))) {
      return NextResponse.json(
        { error: 'studentProfileId must be a valid integer', code: 'INVALID_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate bookingStatus if provided
    if (bookingStatus) {
      const validStatuses = ['confirmed', 'cancelled', 'no_show', 'late_cancel'];
      if (!validStatuses.includes(bookingStatus)) {
        return NextResponse.json(
          { error: 'bookingStatus must be one of: confirmed, cancelled, no_show, late_cancel', code: 'INVALID_BOOKING_STATUS' },
          { status: 400 }
        );
      }
    }

    // Validate paymentId if provided
    if (paymentId !== undefined && paymentId !== null && isNaN(parseInt(paymentId))) {
      return NextResponse.json(
        { error: 'paymentId must be a valid integer', code: 'INVALID_PAYMENT_ID' },
        { status: 400 }
      );
    }

    // Validate creditsUsed if provided
    if (creditsUsed !== undefined && creditsUsed !== null && isNaN(parseInt(creditsUsed))) {
      return NextResponse.json(
        { error: 'creditsUsed must be a valid integer', code: 'INVALID_CREDITS_USED' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      classId: parseInt(classId),
      studentProfileId: parseInt(studentProfileId),
      bookingStatus: bookingStatus || 'confirmed',
      bookedAt: new Date().toISOString(),
      creditsUsed: creditsUsed !== undefined && creditsUsed !== null ? parseInt(creditsUsed) : 0,
    };

    if (cancelledAt) {
      insertData.cancelledAt = cancelledAt;
    }

    if (cancellationType) {
      insertData.cancellationType = cancellationType;
    }

    if (paymentId !== undefined && paymentId !== null) {
      insertData.paymentId = parseInt(paymentId);
    }

    const newBooking = await db.insert(bookings).values(insertData).returning();

    // Send email notifications asynchronously (don't block the response)
    if (newBooking[0]) {
      sendEmailNotifications(newBooking[0].id, insertData.bookingStatus).catch(error => {
        console.error('Failed to send email notifications:', error);
      });
    }

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Helper function to send all email notifications
async function sendEmailNotifications(bookingId: number, bookingStatus: string) {
  try {
    // Fetch booking with all related data
    const bookingData = await db
      .select({
        booking: bookings,
        class: classes,
        classType: classTypes,
        instructor: instructors,
        instructorProfile: userProfiles,
        instructorUser: user,
        studentProfile: userProfiles,
        studentUser: user,
      })
      .from(bookings)
      .innerJoin(classes, eq(bookings.classId, classes.id))
      .innerJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .innerJoin(instructors, eq(classes.instructorId, instructors.id))
      .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .innerJoin(
        { studentProfile: userProfiles },
        eq(bookings.studentProfileId, userProfiles.id)
      )
      .innerJoin(
        { studentUser: user },
        eq(userProfiles.userId, user.id)
      )
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingData.length === 0) {
      console.error('Booking data not found for email notifications');
      return;
    }

    const data = bookingData[0];

    // Detect if this is a Pilates class
    const isPilates = data.classType.name.toLowerCase().includes('pilates') || 
                      data.classType.name.toLowerCase().includes('yoga') ||
                      data.classType.name.toLowerCase().includes('meditation');

    // Fetch studio info for cancellation policy
    const studioData = await db.select().from(studioInfo).limit(1);
    const cancellationPolicy =
      studioData[0]?.cancellationPolicyText ||
      'Please cancel at least 24 hours in advance to avoid losing your credit.';

    // Format date and time
    const classDate = new Date(data.class.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get current capacity
    const currentBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, data.class.id),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    const currentCapacity = currentBookings.length;

    // 1. Send confirmation to student
    if (bookingStatus === 'confirmed') {
      await sendBookingConfirmation({
        studentEmail: data.studentUser.email,
        studentName: data.studentUser.name,
        className: data.classType.name,
        classDate: classDate,
        classTime: data.class.startTime,
        instructorName: data.instructorUser.name,
        location: '2245 E Tioga Street, Philadelphia, PA 19134',
        creditsUsed: data.booking.creditsUsed || 0,
        cancellationPolicy: cancellationPolicy,
        isPilates: isPilates,
      });
    }

    // 2. Send notification to instructor
    await sendInstructorNotification({
      instructorEmail: data.instructorUser.email,
      instructorName: data.instructorUser.name,
      studentName: data.studentUser.name,
      className: data.classType.name,
      classDate: classDate,
      classTime: data.class.startTime,
      currentCapacity: currentCapacity,
      maxCapacity: data.class.capacity,
      bookingId: data.booking.id,
      notificationType: bookingStatus === 'confirmed' ? 'new_booking' : 'cancellation',
    });

    // 3. Send notification to admin
    await sendAdminNotification({
      notificationType: bookingStatus === 'confirmed' ? 'new_booking' : 'cancellation',
      studentName: data.studentUser.name,
      studentEmail: data.studentUser.email,
      className: data.classType.name,
      classDate: classDate,
      classTime: data.class.startTime,
      instructorName: data.instructorUser.name,
      bookingId: data.booking.id,
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    console.log('Email notifications sent successfully for booking:', bookingId);
  } catch (error) {
    console.error('Error sending email notifications:', error);
    // Don't throw - we don't want email failures to break the booking
  }
}