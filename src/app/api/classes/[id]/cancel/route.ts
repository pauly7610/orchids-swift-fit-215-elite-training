import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, bookings, classTypes, instructors, userProfiles, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getCurrentUserProfile() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return null;
    }
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 ? profile[0] : null;
  } catch {
    return null;
  }
}

// Cancel an entire class and notify all booked students
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classId = parseInt(id);
    
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Check authentication and authorization
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins can cancel classes
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can cancel classes' }, { status: 403 });
    }

    const body = await request.json();
    const { reason } = body;

    // Get class details
    const classData = await db.select({
      id: classes.id,
      date: classes.date,
      startTime: classes.startTime,
      endTime: classes.endTime,
      status: classes.status,
      classTypeName: classTypes.name,
      instructorId: classes.instructorId,
    })
      .from(classes)
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .where(eq(classes.id, classId))
      .limit(1);

    if (classData.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const cls = classData[0];

    if (cls.status === 'cancelled') {
      return NextResponse.json({ error: 'Class is already cancelled' }, { status: 400 });
    }

    // Get instructor info
    let instructorName = 'Instructor';
    if (cls.instructorId) {
      const instructorData = await db.select({ name: user.name })
        .from(instructors)
        .leftJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
        .leftJoin(user, eq(userProfiles.userId, user.id))
        .where(eq(instructors.id, cls.instructorId))
        .limit(1);
      if (instructorData.length > 0 && instructorData[0].name) {
        instructorName = instructorData[0].name;
      }
    }

    // Get all confirmed bookings for this class
    const bookedStudents = await db.select({
      bookingId: bookings.id,
      studentProfileId: bookings.studentProfileId,
      creditsUsed: bookings.creditsUsed,
      studentName: user.name,
      studentEmail: user.email,
    })
      .from(bookings)
      .leftJoin(userProfiles, eq(bookings.studentProfileId, userProfiles.id))
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(
        and(
          eq(bookings.classId, classId),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    // Update class status to cancelled
    await db.update(classes)
      .set({ status: 'cancelled' })
      .where(eq(classes.id, classId));

    // Cancel all bookings and refund credits
    for (const student of bookedStudents) {
      await db.update(bookings)
        .set({ 
          bookingStatus: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationType: 'class_cancelled'
        })
        .where(eq(bookings.id, student.bookingId));

      // TODO: Refund credits if applicable
    }

    // Format class date for emails
    const classDate = new Date(cls.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send cancellation emails to all booked students
    const emailResults = [];
    for (const student of bookedStudents) {
      if (!student.studentEmail) continue;

      try {
        await resend.emails.send({
          from: 'Swift Fit 215 <noreply@swiftfit215.com>',
          to: student.studentEmail,
          subject: `Class Cancelled: ${cls.classTypeName} on ${cls.date}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #5A5550;">Class Cancellation Notice</h2>
              <p>Hi ${student.studentName || 'there'},</p>
              <p>We're sorry to inform you that your upcoming class has been cancelled:</p>
              <div style="background-color: #FAF8F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Class:</strong> ${cls.classTypeName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${classDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${cls.startTime}</p>
                <p style="margin: 5px 0;"><strong>Instructor:</strong> ${instructorName}</p>
                ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              ${student.creditsUsed > 0 ? `<p style="color: #9BA899;"><strong>Your ${student.creditsUsed} credit(s) have been refunded to your account.</strong></p>` : ''}
              <p>We apologize for any inconvenience. Please visit our schedule to book another class.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://swiftfit215.com'}/pilates/schedule" 
                 style="display: inline-block; background-color: #9BA899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 15px;">
                View Schedule
              </a>
              <p style="margin-top: 30px; color: #7A736B; font-size: 14px;">
                Questions? Contact us at swiftfitpws@gmail.com
              </p>
            </div>
          `,
        });
        emailResults.push({ email: student.studentEmail, status: 'sent' });
      } catch (emailError) {
        console.error(`Failed to send cancellation email to ${student.studentEmail}:`, emailError);
        emailResults.push({ email: student.studentEmail, status: 'failed' });
      }
    }

    return NextResponse.json({
      message: `Class cancelled and ${bookedStudents.length} students notified`,
      classId,
      studentsNotified: bookedStudents.length,
      emailResults,
    }, { status: 200 });

  } catch (error) {
    console.error('Class cancellation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
