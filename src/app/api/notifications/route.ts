import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_NOTIFICATION_TYPES = ['booking_confirmation', 'reminder', 'cancellation', 'waitlist_available'];
const VALID_STATUSES = ['pending', 'sent', 'failed'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const notification = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, parseInt(id)))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userProfileId = searchParams.get('userProfileId');
    const notificationType = searchParams.get('notificationType');
    const status = searchParams.get('status');

    let query = db.select().from(notifications);

    // Build filter conditions
    const conditions = [];

    if (userProfileId) {
      if (isNaN(parseInt(userProfileId))) {
        return NextResponse.json(
          { error: 'Valid userProfileId is required', code: 'INVALID_USER_PROFILE_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.userProfileId, parseInt(userProfileId)));
    }

    if (notificationType) {
      if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
        return NextResponse.json(
          { error: `Invalid notificationType. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`, code: 'INVALID_NOTIFICATION_TYPE' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.notificationType, notificationType));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

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
    const { userProfileId, notificationType, subject, message, sentAt, status } = body;

    // Validate required fields
    if (!userProfileId) {
      return NextResponse.json(
        { error: 'userProfileId is required', code: 'MISSING_USER_PROFILE_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(userProfileId))) {
      return NextResponse.json(
        { error: 'Valid userProfileId is required', code: 'INVALID_USER_PROFILE_ID' },
        { status: 400 }
      );
    }

    if (!notificationType) {
      return NextResponse.json(
        { error: 'notificationType is required', code: 'MISSING_NOTIFICATION_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
      return NextResponse.json(
        { error: `Invalid notificationType. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`, code: 'INVALID_NOTIFICATION_TYPE' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { error: 'subject is required and must be a non-empty string', code: 'MISSING_SUBJECT' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'message is required and must be a non-empty string', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: {
      userProfileId: number;
      notificationType: string;
      subject: string;
      message: string;
      status: string;
      sentAt?: string;
      createdAt: string;
    } = {
      userProfileId: parseInt(userProfileId),
      notificationType: notificationType.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: status ? status.trim() : 'pending',
      createdAt: new Date().toISOString(),
    };

    if (sentAt) {
      insertData.sentAt = sentAt;
    }

    const newNotification = await db
      .insert(notifications)
      .values(insertData)
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}