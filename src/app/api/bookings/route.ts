import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, classTypes, instructors, userProfiles, user, studioInfo, studentPurchases } from '@/db/schema';
import { eq, and, gte, lte, gt, or, isNull, sql, desc } from 'drizzle-orm';
import { sendBookingConfirmation, sendInstructorNotification, sendAdminNotification } from '@/app/actions/send-booking-emails';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getInstructorNotificationEmails } from '@/lib/instructor-notifications';

// Helper function to get current user's profile ID
async function getCurrentUserProfileId(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return null;
    }
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 ? profile[0].id : null;
  } catch {
    return null;
  }
}

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
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    let studentProfileId = searchParams.get('studentProfileId');
    const classId = searchParams.get('classId');
    const bookingStatus = searchParams.get('bookingStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Check if requesting all bookings (admin only)
    const allBookings = searchParams.get('all') === 'true';
    
    // If no studentProfileId provided and not requesting all, get the current user's bookings
    if (!studentProfileId && !allBookings) {
      const currentUserProfileId = await getCurrentUserProfileId();
      if (currentUserProfileId) {
        studentProfileId = currentUserProfileId.toString();
      }
    }

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

    // Create aliases for student user profile join
    const studentProfile = userProfiles;
    const instructorProfile = db.$with('instructor_profile').as(
      db.select().from(userProfiles)
    );

    // Fetch bookings with class details AND student details for audit trail
    const results = await db
      .select({
        id: bookings.id,
        classId: bookings.classId,
        studentProfileId: bookings.studentProfileId,
        bookingStatus: bookings.bookingStatus,
        bookedAt: bookings.bookedAt,
        cancelledAt: bookings.cancelledAt,
        cancellationType: bookings.cancellationType,
        paymentId: bookings.paymentId,
        creditsUsed: bookings.creditsUsed,
        classDate: classes.date,
        classStartTime: classes.startTime,
        classEndTime: classes.endTime,
        classStatus: classes.status,
        classTypeName: classTypes.name,
      })
      .from(bookings)
      .leftJoin(classes, eq(bookings.classId, classes.id))
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.bookedAt))
      .limit(limit)
      .offset(offset);

    // Fetch student and instructor details separately for each booking
    const enrichedResults = await Promise.all(results.map(async (r) => {
      // Get student info
      let studentName = 'Unknown';
      let studentEmail = 'Unknown';
      if (r.studentProfileId) {
        const studentData = await db
          .select({ name: user.name, email: user.email })
          .from(userProfiles)
          .leftJoin(user, eq(userProfiles.userId, user.id))
          .where(eq(userProfiles.id, r.studentProfileId))
          .limit(1);
        if (studentData.length > 0) {
          studentName = studentData[0].name || 'Unknown';
          studentEmail = studentData[0].email || 'Unknown';
        }
      }

      // Get instructor info
      let instructorName = 'Unknown';
      if (r.classId) {
        const classData = await db
          .select({ instructorId: classes.instructorId })
          .from(classes)
          .where(eq(classes.id, r.classId))
          .limit(1);
        
        if (classData.length > 0 && classData[0].instructorId) {
          const instructorData = await db
            .select({ name: user.name })
            .from(instructors)
            .leftJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
            .leftJoin(user, eq(userProfiles.userId, user.id))
            .where(eq(instructors.id, classData[0].instructorId))
            .limit(1);
          if (instructorData.length > 0) {
            instructorName = instructorData[0].name || 'Unknown';
          }
        }
      }

      return {
        id: r.id,
        classId: r.classId,
        studentProfileId: r.studentProfileId,
        bookingStatus: r.bookingStatus,
        bookedAt: r.bookedAt,
        cancelledAt: r.cancelledAt,
        cancellationType: r.cancellationType,
        paymentId: r.paymentId,
        creditsUsed: r.creditsUsed,
        student: {
          id: r.studentProfileId,
          name: studentName,
          email: studentEmail,
        },
        class: {
          id: r.classId,
          date: r.classDate,
          startTime: r.classStartTime,
          endTime: r.classEndTime,
          status: r.classStatus,
          classType: { name: r.classTypeName },
          instructor: { name: instructorName },
        }
      };
    }));

    return NextResponse.json(enrichedResults, { status: 200 });
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
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `booking-create:${clientId}`,
      RATE_LIMITS.BOOKING_CREATE
    );

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset).toISOString();
      return NextResponse.json(
        {
          error: 'Too many booking requests. Please try again later.',
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

    // Get current user's profile ID from session
    const currentUserProfileId = await getCurrentUserProfileId();
    if (!currentUserProfileId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to book classes.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { classId, bookingStatus, cancelledAt, cancellationType, paymentId, creditsUsed } = body;
    
    // Use the authenticated user's profile ID (ignore any provided studentProfileId for security)
    const studentProfileId = currentUserProfileId;

    // Validate required fields
    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required', code: 'MISSING_CLASS_ID' },
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

    // Determine credits to use - default to 1, minimum 1 credit per booking
    let creditsToUse = creditsUsed !== undefined && creditsUsed !== null ? parseInt(creditsUsed) : 1;
    if (creditsUsed !== undefined && creditsUsed !== null && isNaN(creditsToUse)) {
      return NextResponse.json(
        { error: 'creditsUsed must be a valid integer', code: 'INVALID_CREDITS_USED' },
        { status: 400 }
      );
    }
    
    // Ensure minimum of 1 credit is used (prevent negative or zero values)
    if (creditsToUse < 1) {
      creditsToUse = 1;
    }

    // Execute booking creation with race condition prevention
    const result = await db.transaction(async (tx) => {
      // 1. Get the class data (SQLite doesn't support FOR UPDATE, so we just select)
      const classData = await tx
        .select()
        .from(classes)
        .where(eq(classes.id, parseInt(classId)))
        .limit(1);

      if (classData.length === 0) {
        throw new Error('CLASS_NOT_FOUND: Class does not exist');
      }

      const classInfo = classData[0];

      // Check if this is a soft opening class (December 13th) - these are FREE
      const classDate = new Date(classInfo.date);
      const isSoftOpeningDay = classDate.getMonth() === 11 && // December is month 11 (0-indexed)
                               classDate.getDate() === 13; // Works for any year

      // 2. Check for duplicate booking (same student, same class)
      const existingBooking = await tx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.studentProfileId, studentProfileId),
            eq(bookings.classId, parseInt(classId)),
            eq(bookings.bookingStatus, 'confirmed')
          )
        )
        .limit(1);

      if (existingBooking.length > 0) {
        throw new Error('DUPLICATE_BOOKING: You already have a confirmed booking for this class');
      }

      // 3. Count current confirmed bookings for capacity check
      const confirmedBookingsResult = await tx
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(
          and(
            eq(bookings.classId, parseInt(classId)),
            eq(bookings.bookingStatus, 'confirmed')
          )
        );

      const currentBookings = Number(confirmedBookingsResult[0]?.count || 0);

      // 4. Check if class is full
      if (currentBookings >= classInfo.capacity) {
        throw new Error(`CLASS_FULL: Class is at full capacity (${classInfo.capacity}/${classInfo.capacity})`);
      }

      // 5. Check available credits and deduct them (skip for soft opening FREE classes)
      let actualCreditsUsed = creditsToUse;
      
      if (isSoftOpeningDay) {
        // Soft opening classes are FREE - no credits required
        actualCreditsUsed = 0;
        console.log(`Soft opening class booking - FREE for student ${studentProfileId}`);
      } else {
        // Normal booking - require and deduct credits
        const currentDate = new Date().toISOString();
        
        // Find active purchases with available credits
        const activePurchases = await tx
          .select()
          .from(studentPurchases)
          .where(
            and(
              eq(studentPurchases.studentProfileId, studentProfileId),
              eq(studentPurchases.isActive, true),
              gt(studentPurchases.creditsRemaining, 0),
              or(
                isNull(studentPurchases.expiresAt),
                gt(studentPurchases.expiresAt, currentDate)
              )
            )
          )
          .orderBy(studentPurchases.expiresAt); // Use credits expiring soonest first

        // Calculate total available credits
        const totalAvailableCredits = activePurchases.reduce(
          (sum, purchase) => sum + (purchase.creditsRemaining || 0),
          0
        );

        // User must have credits to book - no free bookings allowed
        if (totalAvailableCredits === 0) {
          throw new Error('INSUFFICIENT_CREDITS: You have no credits available. Please purchase a package first.');
        }

        if (totalAvailableCredits < creditsToUse) {
          throw new Error(`INSUFFICIENT_CREDITS: Required ${creditsToUse} credit(s), but you only have ${totalAvailableCredits}`);
        }

        // Deduct credits from purchases (FIFO - first expiring first)
        let creditsToDeduct = creditsToUse;
        for (const purchase of activePurchases) {
          if (creditsToDeduct <= 0) break;

          const availableInThisPurchase = purchase.creditsRemaining || 0;
          const deductFromThis = Math.min(creditsToDeduct, availableInThisPurchase);
          const newRemaining = availableInThisPurchase - deductFromThis;

          await tx
            .update(studentPurchases)
            .set({ 
              creditsRemaining: newRemaining,
              // Deactivate if no credits remaining
              isActive: newRemaining > 0
            })
            .where(eq(studentPurchases.id, purchase.id));

          creditsToDeduct -= deductFromThis;
        }
      }

      // 6. Prepare insert data for booking
      const insertData: {
        classId: number;
        studentProfileId: number;
        bookingStatus: string;
        bookedAt: string;
        creditsUsed: number;
        cancelledAt?: string;
        cancellationType?: string;
        paymentId?: number;
      } = {
        classId: parseInt(classId),
        studentProfileId: studentProfileId,
        bookingStatus: bookingStatus || 'confirmed',
        bookedAt: new Date().toISOString(),
        creditsUsed: actualCreditsUsed, // 0 for soft opening, normal for other days
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

      // 7. Create the booking
      const newBooking = await tx.insert(bookings).values(insertData).returning();

      return newBooking[0];
    });

    // Send email notifications asynchronously (don't block the response)
    if (result) {
      sendEmailNotifications(result.id, result.bookingStatus).catch(error => {
        console.error('Failed to send email notifications:', error);
      });
    }

    return NextResponse.json({
      ...result,
      message: `Class booked successfully! ${result.creditsUsed} credit(s) used.`
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle specific error codes
    if (error instanceof Error) {
      if (error.message.startsWith('INSUFFICIENT_CREDITS')) {
        return NextResponse.json(
          { error: error.message.split(': ')[1], code: 'INSUFFICIENT_CREDITS' },
          { status: 400 }
        );
      }
      if (error.message.startsWith('CLASS_FULL')) {
        return NextResponse.json(
          { error: error.message.split(': ')[1], code: 'CLASS_FULL' },
          { status: 409 }
        );
      }
      if (error.message.startsWith('CLASS_NOT_FOUND')) {
        return NextResponse.json(
          { error: error.message.split(': ')[1], code: 'CLASS_NOT_FOUND' },
          { status: 404 }
        );
      }
      if (error.message.startsWith('DUPLICATE_BOOKING')) {
        return NextResponse.json(
          { error: error.message.split(': ')[1], code: 'DUPLICATE_BOOKING' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Helper function to send all email notifications
async function sendEmailNotifications(bookingId: number, bookingStatus: string) {
  try {
    // Fetch booking with student data
    const bookingWithStudent = await db
      .select({
        booking: bookings,
        class: classes,
        classType: classTypes,
        studentProfile: userProfiles,
        studentUser: user,
      })
      .from(bookings)
      .innerJoin(classes, eq(bookings.classId, classes.id))
      .innerJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .innerJoin(userProfiles, eq(bookings.studentProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingWithStudent.length === 0) {
      console.error('Booking data not found for email notifications');
      return;
    }

    const bookingData = bookingWithStudent[0];

    // Fetch instructor data separately
    const instructorData = await db
      .select({
        instructor: instructors,
        instructorProfile: userProfiles,
        instructorUser: user,
      })
      .from(instructors)
      .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(instructors.id, bookingData.class.instructorId))
      .limit(1);

    if (instructorData.length === 0) {
      console.error('Instructor data not found for email notifications');
      return;
    }

    const instructor = instructorData[0];

    // Detect if this is a Pilates class
    const isPilates = bookingData.classType.name.toLowerCase().includes('pilates') || 
                      bookingData.classType.name.toLowerCase().includes('yoga') ||
                      bookingData.classType.name.toLowerCase().includes('meditation');

    // Fetch studio info for cancellation policy
    const studioData = await db.select().from(studioInfo).limit(1);
    const cancellationPolicy =
      studioData[0]?.cancellationPolicyText ||
      'Please cancel at least 24 hours in advance to avoid losing your credit.';

    // Format date and time
    const classDate = new Date(bookingData.class.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get current capacity
    const currentBookingsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, bookingData.class.id),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    const currentCapacity = Number(currentBookingsResult[0]?.count || 0);

    // 1. Send confirmation to student
    if (bookingStatus === 'confirmed') {
      await sendBookingConfirmation({
        studentEmail: bookingData.studentUser.email,
        studentName: bookingData.studentUser.name,
        className: bookingData.classType.name,
        classDate: classDate,
        classTime: bookingData.class.startTime,
        instructorName: instructor.instructorUser.name,
        location: '2245 E Tioga Street, Philadelphia, PA 19134',
        creditsUsed: bookingData.booking.creditsUsed || 0,
        cancellationPolicy: cancellationPolicy,
        isPilates: isPilates,
      });
    }

    // 2. Send notification to instructor
    await sendInstructorNotification({
      instructorEmail: instructor.instructorUser.email,
      instructorName: instructor.instructorUser.name,
      studentName: bookingData.studentUser.name,
      className: bookingData.classType.name,
      classDate: classDate,
      classTime: bookingData.class.startTime,
      currentCapacity: currentCapacity,
      maxCapacity: bookingData.class.capacity,
      bookingId: bookingData.booking.id,
      notificationType: bookingStatus === 'confirmed' ? 'new_booking' : 'cancellation',
    });

    // 3. Send notification to admin
    await sendAdminNotification({
      notificationType: bookingStatus === 'confirmed' ? 'new_booking' : 'cancellation',
      studentName: bookingData.studentUser.name,
      studentEmail: bookingData.studentUser.email,
      className: bookingData.classType.name,
      classDate: classDate,
      classTime: bookingData.class.startTime,
      instructorName: instructor.instructorUser.name,
      bookingId: bookingData.booking.id,
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    // 4. Send notifications to instructor-specific additional emails
    // (e.g., Desiree → internally.a.queen@gmail.com, Nasir → Aceinvestgp@gmail.com)
    const additionalEmails = getInstructorNotificationEmails(instructor.instructorUser.name);
    
    for (const additionalEmail of additionalEmails) {
      // Avoid duplicate emails if the additional email is the same as instructor or admin
      if (
        additionalEmail.toLowerCase() !== instructor.instructorUser.email.toLowerCase() &&
        additionalEmail.toLowerCase() !== (process.env.ADMIN_EMAIL || '').toLowerCase()
      ) {
        try {
          await sendInstructorNotification({
            instructorEmail: additionalEmail,
            instructorName: instructor.instructorUser.name,
            studentName: bookingData.studentUser.name,
            className: bookingData.classType.name,
            classDate: classDate,
            classTime: bookingData.class.startTime,
            currentCapacity: currentCapacity,
            maxCapacity: bookingData.class.capacity,
            bookingId: bookingData.booking.id,
            notificationType: bookingStatus === 'confirmed' ? 'new_booking' : 'cancellation',
          });
          console.log(`Additional notification sent to ${additionalEmail} for instructor ${instructor.instructorUser.name}`);
        } catch (err) {
          console.error(`Failed to send additional notification to ${additionalEmail}:`, err);
          // Continue with other notifications even if this one fails
        }
      }
    }

    console.log('Email notifications sent successfully for booking:', bookingId);
  } catch (error) {
    console.error('Error sending email notifications:', error);
    // Don't throw - we don't want email failures to break the booking
  }
}
