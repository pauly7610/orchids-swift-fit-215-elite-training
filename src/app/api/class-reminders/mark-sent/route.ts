import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classReminderTracking } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reminderId } = body;

    // Validate reminderId is provided
    if (!reminderId) {
      return NextResponse.json(
        { 
          error: 'Reminder ID is required',
          code: 'MISSING_REMINDER_ID'
        },
        { status: 400 }
      );
    }

    // Validate reminderId is a valid integer
    const parsedReminderId = parseInt(reminderId);
    if (isNaN(parsedReminderId)) {
      return NextResponse.json(
        { 
          error: 'Reminder ID must be a valid integer',
          code: 'INVALID_REMINDER_ID'
        },
        { status: 400 }
      );
    }

    // Check if reminder exists
    const existingReminder = await db
      .select()
      .from(classReminderTracking)
      .where(eq(classReminderTracking.id, parsedReminderId))
      .limit(1);

    if (existingReminder.length === 0) {
      return NextResponse.json(
        { 
          error: 'Reminder not found',
          code: 'REMINDER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update reminder to mark as sent
    const updatedReminder = await db
      .update(classReminderTracking)
      .set({
        reminderSent: true,
        reminderSentAt: new Date().toISOString()
      })
      .where(eq(classReminderTracking.id, parsedReminderId))
      .returning();

    return NextResponse.json(updatedReminder[0], { status: 200 });

  } catch (error) {
    console.error('POST /api/class-reminders/mark-sent error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}