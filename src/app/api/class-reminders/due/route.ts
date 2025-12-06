import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classReminderTracking, userProfiles } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];

    // Query reminders that are due and not yet sent
    // Join with userProfiles to get student details if available
    const dueReminders = await db
      .select({
        id: classReminderTracking.id,
        studentProfileId: classReminderTracking.studentProfileId,
        email: classReminderTracking.email,
        lastClassDate: classReminderTracking.lastClassDate,
        reminderScheduledFor: classReminderTracking.reminderScheduledFor,
        reminderSent: classReminderTracking.reminderSent,
        reminderSentAt: classReminderTracking.reminderSentAt,
        createdAt: classReminderTracking.createdAt,
        studentName: userProfiles.userId,
        studentEmail: userProfiles.phone,
      })
      .from(classReminderTracking)
      .leftJoin(
        userProfiles,
        eq(classReminderTracking.studentProfileId, userProfiles.id)
      )
      .where(
        and(
          lte(classReminderTracking.reminderScheduledFor, today),
          eq(classReminderTracking.reminderSent, false)
        )
      )
      .orderBy(classReminderTracking.reminderScheduledFor);

    // Transform the results to match the expected response format
    const formattedReminders = dueReminders.map((reminder) => {
      const baseReminder: any = {
        id: reminder.id,
        studentProfileId: reminder.studentProfileId,
        email: reminder.email,
        lastClassDate: reminder.lastClassDate,
        reminderScheduledFor: reminder.reminderScheduledFor,
        reminderSent: reminder.reminderSent,
        createdAt: reminder.createdAt,
      };

      // Add student profile info if available
      if (reminder.studentProfileId && reminder.studentName) {
        baseReminder.studentName = reminder.studentName;
      }
      if (reminder.studentProfileId && reminder.studentEmail) {
        baseReminder.studentEmail = reminder.studentEmail;
      }

      return baseReminder;
    });

    return NextResponse.json(
      {
        dueReminders: formattedReminders,
        count: formattedReminders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}