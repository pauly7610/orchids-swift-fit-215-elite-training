import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, userProfiles } from '@/db/schema';
import { eq, and, like, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = ['scheduled', 'cancelled', 'completed'];

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  if (!user) return false;
  
  const profile = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);
  
  return profile.length > 0 && profile[0].role === 'admin';
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

      const record = await db
        .select()
        .from(classes)
        .where(eq(classes.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Class not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filtering, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const instructorId = searchParams.get('instructorId');
    const classTypeId = searchParams.get('classTypeId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = db.select().from(classes);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(like(classes.date, `%${search}%`));
    }

    if (instructorId && !isNaN(parseInt(instructorId))) {
      conditions.push(eq(classes.instructorId, parseInt(instructorId)));
    }

    if (classTypeId && !isNaN(parseInt(classTypeId))) {
      conditions.push(eq(classes.classTypeId, parseInt(classTypeId)));
    }

    if (status) {
      conditions.push(eq(classes.status, status));
    }

    if (date) {
      conditions.push(eq(classes.date, date));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(classes.date), desc(classes.startTime))
      .limit(limit)
      .offset(offset);

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
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { classTypeId, instructorId, date, startTime, endTime, capacity, price, status } = body;

    // Validate required fields
    if (!classTypeId) {
      return NextResponse.json(
        { error: 'classTypeId is required', code: 'MISSING_CLASS_TYPE_ID' },
        { status: 400 }
      );
    }

    if (!instructorId) {
      return NextResponse.json(
        { error: 'instructorId is required', code: 'MISSING_INSTRUCTOR_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: 'startTime is required', code: 'MISSING_START_TIME' },
        { status: 400 }
      );
    }

    if (!endTime) {
      return NextResponse.json(
        { error: 'endTime is required', code: 'MISSING_END_TIME' },
        { status: 400 }
      );
    }

    // Validate field types
    if (isNaN(parseInt(classTypeId))) {
      return NextResponse.json(
        { error: 'classTypeId must be a valid integer', code: 'INVALID_CLASS_TYPE_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(instructorId))) {
      return NextResponse.json(
        { error: 'instructorId must be a valid integer', code: 'INVALID_INSTRUCTOR_ID' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Validate capacity if provided
    if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) < 0)) {
      return NextResponse.json(
        { error: 'capacity must be a valid positive integer', code: 'INVALID_CAPACITY' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (price !== undefined && price !== null && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      return NextResponse.json(
        { error: 'price must be a valid positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const insertData = {
      classTypeId: parseInt(classTypeId),
      instructorId: parseInt(instructorId),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      capacity: capacity !== undefined ? parseInt(capacity) : 15,
      price: price !== undefined && price !== null ? parseFloat(price) : null,
      status: status || 'scheduled',
      createdAt: new Date().toISOString(),
    };

    const newClass = await db
      .insert(classes)
      .values(insertData)
      .returning();

    return NextResponse.json(newClass[0], { status: 201 });
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
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { classTypeId, instructorId, date, startTime, endTime, capacity, price, status } = body;

    // Validate fields if provided
    if (classTypeId !== undefined && isNaN(parseInt(classTypeId))) {
      return NextResponse.json(
        { error: 'classTypeId must be a valid integer', code: 'INVALID_CLASS_TYPE_ID' },
        { status: 400 }
      );
    }

    if (instructorId !== undefined && isNaN(parseInt(instructorId))) {
      return NextResponse.json(
        { error: 'instructorId must be a valid integer', code: 'INVALID_INSTRUCTOR_ID' },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) < 0)) {
      return NextResponse.json(
        { error: 'capacity must be a valid positive integer', code: 'INVALID_CAPACITY' },
        { status: 400 }
      );
    }

    if (price !== undefined && price !== null && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      return NextResponse.json(
        { error: 'price must be a valid positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (classTypeId !== undefined) updates.classTypeId = parseInt(classTypeId);
    if (instructorId !== undefined) updates.instructorId = parseInt(instructorId);
    if (date !== undefined) updates.date = date.trim();
    if (startTime !== undefined) updates.startTime = startTime.trim();
    if (endTime !== undefined) updates.endTime = endTime.trim();
    if (capacity !== undefined) updates.capacity = parseInt(capacity);
    if (price !== undefined) updates.price = price !== null ? parseFloat(price) : null;
    if (status !== undefined) updates.status = status;

    const updated = await db
      .update(classes)
      .set(updates)
      .where(eq(classes.id, parseInt(id)))
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
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(classes)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Class deleted successfully',
        deleted: deleted[0],
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