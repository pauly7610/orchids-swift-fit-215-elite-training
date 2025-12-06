import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailSubscribers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isActiveParam = searchParams.get('isActive');

    // Single subscriber by ID
    if (id) {
      const subscriberId = parseInt(id);
      if (isNaN(subscriberId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const subscriber = await db
        .select()
        .from(emailSubscribers)
        .where(eq(emailSubscribers.id, subscriberId))
        .limit(1);

      if (subscriber.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found', code: 'SUBSCRIBER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(subscriber[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Valid limit is required (1-100)', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Valid offset is required (>= 0)', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    let query = db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt));

    // Filter by active status if provided
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      query = query.where(eq(emailSubscribers.isActive, isActive));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, source } = body;

    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { error: 'Email is required', code: 'EMAIL_REQUIRED' },
        { status: 400 }
      );
    }

    if (!source || typeof source !== 'string' || source.trim() === '') {
      return NextResponse.json(
        { error: 'Source is required', code: 'SOURCE_REQUIRED' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.email, sanitizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already subscribed', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Prepare subscriber data
    const subscriberData = {
      email: sanitizedEmail,
      name: name ? name.trim() : null,
      phone: phone ? phone.trim() : null,
      source: source.trim(),
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };

    // Insert new subscriber
    const newSubscriber = await db
      .insert(emailSubscribers)
      .values(subscriberData)
      .returning();

    return NextResponse.json(newSubscriber[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'ID_REQUIRED' },
        { status: 400 }
      );
    }

    const subscriberId = parseInt(id);
    if (isNaN(subscriberId)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone, isActive, email, source } = body;

    // Prevent updating email and source
    if (email !== undefined) {
      return NextResponse.json(
        { error: 'Email cannot be updated', code: 'EMAIL_UPDATE_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    if (source !== undefined) {
      return NextResponse.json(
        { error: 'Source cannot be updated', code: 'SOURCE_UPDATE_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existing = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.id, subscriberId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found', code: 'SUBSCRIBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string | null;
      phone?: string | null;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      updateData.name = name ? name.trim() : null;
    }

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
      updateData.isActive = isActive;
    }

    // Update subscriber
    const updated = await db
      .update(emailSubscribers)
      .set(updateData)
      .where(eq(emailSubscribers.id, subscriberId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'ID_REQUIRED' },
        { status: 400 }
      );
    }

    const subscriberId = parseInt(id);
    if (isNaN(subscriberId)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existing = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.id, subscriberId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found', code: 'SUBSCRIBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Soft delete: set isActive to false
    const updated = await db
      .update(emailSubscribers)
      .set({ isActive: false })
      .where(eq(emailSubscribers.id, subscriberId))
      .returning();

    return NextResponse.json(
      {
        message: 'Subscriber deactivated successfully',
        subscriber: updated[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}