import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  classReminderTracking, 
  userProfiles, 
  user,
  studentPurchases,
  memberships 
} from '@/db/schema';
import { eq, and, lte, lt } from 'drizzle-orm';
import { resend } from '@/lib/resend';
import { PilatesClassReminder } from '@/emails/pilates-class-reminder';
import { render } from '@react-email/render';

/**
 * Combined daily cron job that handles:
 * 1. Send 30-day class reminders
 * 2. Expire old credits
 * 3. Process membership renewals
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const results = {
      classReminders: { sent: 0, failed: 0, errors: [] as string[] },
      creditsExpired: { count: 0, errors: [] as string[] },
      membershipsProcessed: { count: 0, errors: [] as string[] },
    };

    // ============================================
    // TASK 1: Send 30-Day Class Reminders
    // ============================================
    console.log('Starting class reminders...');
    try {
      const dueReminders = await db
        .select({
          reminderId: classReminderTracking.id,
          email: classReminderTracking.email,
          lastClassDate: classReminderTracking.lastClassDate,
          studentProfileId: classReminderTracking.studentProfileId,
          userName: user.name,
          userEmail: user.email,
          emailReminders: userProfiles.emailReminders,
        })
        .from(classReminderTracking)
        .leftJoin(userProfiles, eq(classReminderTracking.studentProfileId, userProfiles.id))
        .leftJoin(user, eq(userProfiles.userId, user.id))
        .where(
          and(
            lte(classReminderTracking.reminderScheduledFor, today),
            eq(classReminderTracking.reminderSent, false)
          )
        )
        .limit(50);

      for (const reminder of dueReminders) {
        try {
          // Check if user has opted out of email reminders
          if (reminder.emailReminders === false) {
            console.log(`Reminder ${reminder.reminderId}: User opted out, marking as sent`);
            await db
              .update(classReminderTracking)
              .set({
                reminderSent: true,
                reminderSentAt: new Date().toISOString(),
              })
              .where(eq(classReminderTracking.id, reminder.reminderId));
            continue;
          }

          const recipientEmail = reminder.email || reminder.userEmail;
          const recipientName = reminder.userName || 'Valued Student';

          if (!recipientEmail) {
            results.classReminders.failed++;
            results.classReminders.errors.push(`Reminder ${reminder.reminderId}: No email`);
            continue;
          }

          const lastClassDate = new Date(reminder.lastClassDate);
          const daysSince = Math.floor((Date.now() - lastClassDate.getTime()) / (1000 * 60 * 60 * 24));

          const emailHtml = render(
            PilatesClassReminder({
              studentName: recipientName,
              lastClassDate: lastClassDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              daysSinceLastClass: daysSince,
            })
          );

          await resend.emails.send({
            from: 'Swift Fit Pilates <noreply@swiftfit215.com>',
            to: recipientEmail,
            subject: `We miss you at Swift Fit! 💕 Time to return to your practice`,
            html: emailHtml,
          });

          await db
            .update(classReminderTracking)
            .set({
              reminderSent: true,
              reminderSentAt: new Date().toISOString(),
            })
            .where(eq(classReminderTracking.id, reminder.reminderId));

          results.classReminders.sent++;
        } catch (error) {
          results.classReminders.failed++;
          results.classReminders.errors.push(
            `Reminder ${reminder.reminderId}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
        }
      }

      console.log(`Class reminders: ${results.classReminders.sent} sent, ${results.classReminders.failed} failed`);
    } catch (error) {
      console.error('Class reminders error:', error);
      results.classReminders.errors.push(`System error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // ============================================
    // TASK 2: Expire Old Credits
    // ============================================
    console.log('Starting credit expiration...');
    try {
      const expired = await db
        .update(studentPurchases)
        .set({ status: 'expired' })
        .where(
          and(
            lt(studentPurchases.expiresAt, new Date().toISOString()),
            eq(studentPurchases.status, 'active')
          )
        );

      results.creditsExpired.count = expired.rowsAffected || 0;
      console.log(`Expired ${results.creditsExpired.count} credit packages`);
    } catch (error) {
      console.error('Credit expiration error:', error);
      results.creditsExpired.errors.push(`System error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // ============================================
    // TASK 3: Process Membership Renewals
    // ============================================
    console.log('Starting membership renewals...');
    try {
      const renewalsDue = await db
        .select()
        .from(memberships)
        .where(
          and(
            lte(memberships.expiresAt, new Date().toISOString()),
            eq(memberships.autoRenew, true),
            eq(memberships.status, 'active')
          )
        )
        .limit(50);

      for (const membership of renewalsDue) {
        try {
          // Calculate new expiry (30 days from old expiry)
          const oldExpiry = new Date(membership.expiresAt);
          const newExpiry = new Date(oldExpiry);
          newExpiry.setDate(newExpiry.getDate() + 30);

          await db
            .update(memberships)
            .set({
              expiresAt: newExpiry.toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(memberships.id, membership.id));

          results.membershipsProcessed.count++;
        } catch (error) {
          results.membershipsProcessed.errors.push(
            `Membership ${membership.id}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
        }
      }

      console.log(`Processed ${results.membershipsProcessed.count} membership renewals`);
    } catch (error) {
      console.error('Membership renewals error:', error);
      results.membershipsProcessed.errors.push(`System error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // ============================================
    // Send Admin Summary Report
    // ============================================
    try {
      await resend.emails.send({
        from: 'Swift Fit Pilates <noreply@swiftfit215.com>',
        to: process.env.ADMIN_EMAIL || 'swiftfitpws@gmail.com',
        subject: `Daily Tasks Report - ${today}`,
        html: `
          <h2>Swift Fit Daily Tasks Report</h2>
          <p><strong>Date:</strong> ${today}</p>
          
          <h3>📧 Class Reminders</h3>
          <p>Sent: ${results.classReminders.sent} | Failed: ${results.classReminders.failed}</p>
          ${results.classReminders.errors.length > 0 ? `
            <details>
              <summary>Errors (${results.classReminders.errors.length})</summary>
              <ul>${results.classReminders.errors.map(e => `<li>${e}</li>`).join('')}</ul>
            </details>
          ` : ''}
          
          <h3>⏰ Credits Expired</h3>
          <p>Count: ${results.creditsExpired.count}</p>
          ${results.creditsExpired.errors.length > 0 ? `
            <details>
              <summary>Errors</summary>
              <ul>${results.creditsExpired.errors.map(e => `<li>${e}</li>`).join('')}</ul>
            </details>
          ` : ''}
          
          <h3>🔄 Memberships Renewed</h3>
          <p>Count: ${results.membershipsProcessed.count}</p>
          ${results.membershipsProcessed.errors.length > 0 ? `
            <details>
              <summary>Errors</summary>
              <ul>${results.membershipsProcessed.errors.map(e => `<li>${e}</li>`).join('')}</ul>
            </details>
          ` : ''}
          
          <hr />
          <p style="color: #666; font-size: 12px;">Automated daily tasks from Swift Fit system.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send admin report:', error);
    }

    return NextResponse.json({
      success: true,
      date: today,
      results,
    });

  } catch (error) {
    console.error('Daily tasks error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
