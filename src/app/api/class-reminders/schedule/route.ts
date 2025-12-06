import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classReminderTracking } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfileId, email, lastClassDate } = body;

    // Validation: lastClassDate is required
    if (!lastClassDate) {
      return NextResponse.json(
        { 
          error: 'lastClassDate is required',
          code: 'MISSING_LAST_CLASS_DATE'
        },
        { status: 400 }
      );
    }

    // Validation: Either studentProfileId OR email must be provided
    if (!studentProfileId && !email) {
      return NextResponse.json(
        { 
          error: 'Either studentProfileId or email must be provided',
          code: 'MISSING_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    // Validation: Validate lastClassDate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(lastClassDate)) {
      return NextResponse.json(
        { 
          error: 'lastClassDate must be in YYYY-MM-DD format',
          code: 'INVALID_DATE_FORMAT'
        },
        { status: 400 }
      );
    }

    // Parse and validate lastClassDate is a valid date
    const lastClassDateObj = new Date(lastClassDate);
    if (isNaN(lastClassDateObj.getTime())) {
      return NextResponse.json(
        { 
          error: 'lastClassDate is not a valid date',
          code: 'INVALID_DATE'
        },
        { status: 400 }
      );
    }

    // Calculate reminderScheduledFor (lastClassDate + 30 days)
    const reminderDate = new Date(lastClassDateObj);
    reminderDate.setDate(reminderDate.getDate() + 30);

    // Format reminderScheduledFor as YYYY-MM-DD
    const reminderScheduledFor = reminderDate.toISOString().split('T')[0];

    // Prepare insert data
    const insertData: {
      studentProfileId?: number;
      email?: string;
      lastClassDate: string;
      reminderScheduledFor: string;
      reminderSent: boolean;
      createdAt: string;
    } = {
      lastClassDate,
      reminderScheduledFor,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    // Add studentProfileId if provided
    if (studentProfileId) {
      insertData.studentProfileId = studentProfileId;
    }

    // Add email if provided
    if (email) {
      insertData.email = email.trim().toLowerCase();
    }

    // Insert into database
    const newReminder = await db.insert(classReminderTracking)
      .values(insertData)
      .returning();

    return NextResponse.json(newReminder[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/class-reminders/schedule error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}