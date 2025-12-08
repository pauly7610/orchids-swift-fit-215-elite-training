import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classReminderTracking, userProfiles, user } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { resend } from '@/lib/resend';
import { PilatesClassReminder } from '@/emails/pilates-class-reminder';
import { render } from '@react-email/render';

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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch due reminders with student information
    const dueReminders = await db
      .select({
        reminderId: classReminderTracking.id,
        email: classReminderTracking.email,
        lastClassDate: classReminderTracking.lastClassDate,
        studentProfileId: classReminderTracking.studentProfileId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(classReminderTracking)
      .leftJoin(
        userProfiles,
        eq(classReminderTracking.studentProfileId, userProfiles.id)
      )
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(
        and(
          lte(classReminderTracking.reminderScheduledFor, today),
          eq(classReminderTracking.reminderSent, false)
        )
      )
      .limit(50); // Process max 50 per run

    console.log(`Found ${dueReminders.length} due reminders to send`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminders
    for (const reminder of dueReminders) {
      try {
        // Determine email and name
        const recipientEmail = reminder.email || reminder.userEmail;
        const recipientName = reminder.userName || 'Valued Student';

        if (!recipientEmail) {
          console.log(`No email for reminder ${reminder.reminderId}, skipping`);
          results.errors.push(`Reminder ${reminder.reminderId}: No email address`);
          results.failed++;
          continue;
        }

        // Calculate days since last class
        const lastClassDate = new Date(reminder.lastClassDate);
        const now = new Date();
        const daysSince = Math.floor((now.getTime() - lastClassDate.getTime()) / (1000 * 60 * 60 * 24));

        // Format date for email
        const formattedDate = lastClassDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Send email using Resend
        const emailHtml = render(
          PilatesClassReminder({
            studentName: recipientName,
            lastClassDate: formattedDate,
            daysSinceLastClass: daysSince,
          })
        );

        await resend.emails.send({
          from: 'Swift Fit Pilates <noreply@swiftfit215.com>',
          to: recipientEmail,
          subject: `We miss you at Swift Fit! 💕 Time to return to your practice`,
          html: emailHtml,
        });

        // Mark reminder as sent
        await db
          .update(classReminderTracking)
          .set({
            reminderSent: true,
            reminderSentAt: new Date().toISOString(),
          })
          .where(eq(classReminderTracking.id, reminder.reminderId));

        console.log(`Sent reminder to ${recipientEmail}`);
        results.sent++;

      } catch (error) {
        console.error(`Failed to send reminder ${reminder.reminderId}:`, error);
        results.failed++;
        results.errors.push(
          `Reminder ${reminder.reminderId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Send admin notification email with summary
    if (dueReminders.length > 0) {
      try {
        await resend.emails.send({
          from: 'Swift Fit System <noreply@swiftfit215.com>',
          to: 'swiftfitpws@gmail.com',
          subject: `30-Day Reminder Report: ${results.sent} sent, ${results.failed} failed`,
          html: `
            <h2>Swift Fit 30-Day Reminder Report</h2>
            <p><strong>Date:</strong> ${today}</p>
            <p><strong>Total Due:</strong> ${dueReminders.length}</p>
            <p><strong>Successfully Sent:</strong> ${results.sent}</p>
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
        date: today,
        totalDue: dueReminders.length,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
        message: `Sent ${results.sent} reminders, ${results.failed} failed`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Cron job error:', error);
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
export const maxDuration = 60; // 60 seconds timeout for cron jobs
