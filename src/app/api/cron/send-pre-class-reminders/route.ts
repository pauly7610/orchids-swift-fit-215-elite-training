import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, classTypes, instructors, userProfiles, user } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { resend } from '@/lib/resend';
import { PilatesPreClassReminder } from '@/emails/pilates-pre-class-reminder';
import { render } from '@react-email/render';

/**
 * Cron job to send pre-class reminders based on user preferences
 * Runs hourly and sends reminders for classes coming up within user's preferred window
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get all confirmed bookings for classes happening in the next 48 hours
    // We'll filter by individual user preferences below
    const maxHoursAhead = 48;
    const minDate = now.toISOString();
    const maxDate = new Date(now.getTime() + maxHoursAhead * 60 * 60 * 1000).toISOString();

    // Fetch upcoming bookings with class and student details
    const upcomingBookings = await db
      .select({
        bookingId: bookings.id,
        classId: bookings.classId,
        studentProfileId: bookings.studentProfileId,
        classDate: classes.date,
        classStartTime: classes.startTime,
        className: classTypes.name,
        instructorId: classes.instructorId,
        // User profile fields
        userId: userProfiles.userId,
        emailReminders: userProfiles.emailReminders,
        reminderHoursBefore: userProfiles.reminderHoursBefore,
        // User fields
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(bookings)
      .innerJoin(classes, eq(bookings.classId, classes.id))
      .innerJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .innerJoin(userProfiles, eq(bookings.studentProfileId, userProfiles.id))
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(
        and(
          eq(bookings.bookingStatus, 'confirmed'),
          gte(classes.date, now.toISOString().split('T')[0])
        )
      )
      .limit(100);

    console.log(`Found ${upcomingBookings.length} upcoming bookings to check for reminders`);

    // Track which bookings we've sent reminders for (to avoid duplicates)
    const remindersSentKey = `pre-class-reminders-${now.toISOString().split('T')[0]}`;
    
    for (const booking of upcomingBookings) {
      try {
        // Skip if user has opted out of email reminders
        if (booking.emailReminders === false) {
          results.skipped++;
          continue;
        }

        // Calculate hours until class
        const classDateTime = new Date(`${booking.classDate}T${booking.classStartTime}`);
        const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Skip if class is in the past
        if (hoursUntilClass < 0) {
          continue;
        }

        // Get user's preferred reminder window (default 24 hours)
        const reminderWindow = booking.reminderHoursBefore || 24;

        // Check if we should send reminder:
        // - Class is within reminder window (e.g., less than 24 hours away)
        // - Class is still at least 1 hour away (don't send last-minute reminders)
        const shouldSendReminder = hoursUntilClass <= reminderWindow && hoursUntilClass >= 1;

        // Also check if this is within the "sweet spot" to avoid duplicate sends
        // We send when hoursUntilClass is close to reminderWindow (within 1 hour tolerance)
        const isWithinSendWindow = Math.abs(hoursUntilClass - reminderWindow) <= 1 || 
                                    (hoursUntilClass <= reminderWindow && hoursUntilClass >= reminderWindow - 1);

        if (!shouldSendReminder || !isWithinSendWindow) {
          continue;
        }

        // Get instructor name
        const instructorData = await db
          .select({ name: user.name })
          .from(instructors)
          .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
          .innerJoin(user, eq(userProfiles.userId, user.id))
          .where(eq(instructors.id, booking.instructorId))
          .limit(1);

        const instructorName = instructorData[0]?.name || 'Your Instructor';

        // Format class date
        const formattedDate = classDateTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Render email
        const emailHtml = render(
          PilatesPreClassReminder({
            studentName: booking.studentName,
            className: booking.className,
            classDate: formattedDate,
            classTime: booking.classStartTime,
            instructorName,
            hoursUntilClass: Math.round(hoursUntilClass),
            location: '2245 E Tioga Street, Philadelphia, PA 19134',
          })
        );

        // Send email
        await resend.emails.send({
          from: 'Swift Fit Pilates <noreply@swiftfit215.com>',
          to: booking.studentEmail,
          subject: `🧘 Reminder: ${booking.className} in ${Math.round(hoursUntilClass)} hours`,
          html: emailHtml,
          replyTo: 'swiftfitpws@gmail.com',
        });

        console.log(`Sent pre-class reminder to ${booking.studentEmail} for booking ${booking.bookingId}`);
        results.sent++;

      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.bookingId}:`, error);
        results.failed++;
        results.errors.push(
          `Booking ${booking.bookingId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Send admin summary if any reminders were processed
    if (results.sent > 0 || results.failed > 0) {
      try {
        await resend.emails.send({
          from: 'Swift Fit Pilates <noreply@swiftfit215.com>',
          to: process.env.ADMIN_EMAIL || 'swiftfitpws@gmail.com',
          subject: `Pre-Class Reminders: ${results.sent} sent, ${results.failed} failed`,
          html: `
            <h2>Swift Fit Pre-Class Reminder Report</h2>
            <p><strong>Time:</strong> ${now.toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
            <p><strong>Bookings Checked:</strong> ${upcomingBookings.length}</p>
            <p><strong>Reminders Sent:</strong> ${results.sent}</p>
            <p><strong>Skipped (opted out):</strong> ${results.skipped}</p>
            <p><strong>Failed:</strong> ${results.failed}</p>
            ${results.errors.length > 0 ? `
              <h3>Errors:</h3>
              <ul>
                ${results.errors.map(err => `<li>${err}</li>`).join('')}
              </ul>
            ` : ''}
            <hr />
            <p style="color: #666; font-size: 12px;">This is an automated report from the Swift Fit reminder system.</p>
          `,
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: now.toISOString(),
        bookingsChecked: upcomingBookings.length,
        sent: results.sent,
        skipped: results.skipped,
        failed: results.failed,
        errors: results.errors,
        message: `Sent ${results.sent} pre-class reminders, ${results.skipped} skipped, ${results.failed} failed`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Pre-class reminder cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

