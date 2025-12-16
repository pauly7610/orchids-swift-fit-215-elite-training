import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, userProfiles, classTypes, instructors, user as userTable, bookings } from '@/db/schema';
import { eq, and, like, asc, gte, sql, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to extract first name from full name or email
function extractDisplayName(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/)[0];
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'Unknown';
}

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
    const limitNum = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offsetNum = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const instructorIdParam = searchParams.get('instructorId');
    const classTypeIdParam = searchParams.get('classTypeId');
    const statusParam = searchParams.get('status');
    const dateParam = searchParams.get('date');
    const fromDateParam = searchParams.get('fromDate');

    // Build WHERE conditions
    const conditions: any[] = [];

    if (search) {
      conditions.push(like(classes.date, `%${search}%`));
    }

    if (instructorIdParam && !isNaN(parseInt(instructorIdParam))) {
      conditions.push(eq(classes.instructorId, parseInt(instructorIdParam)));
    }

    if (classTypeIdParam && !isNaN(parseInt(classTypeIdParam))) {
      conditions.push(eq(classes.classTypeId, parseInt(classTypeIdParam)));
    }

    if (statusParam) {
      conditions.push(eq(classes.status, statusParam));
    }

    if (dateParam) {
      conditions.push(eq(classes.date, dateParam));
    }

    // Filter from a specific date onwards (e.g., today)
    if (fromDateParam) {
      conditions.push(gte(classes.date, fromDateParam));
    }

    // Join with classTypes and instructors to get names
    const baseQuery = db.select({
      id: classes.id,
      classTypeId: classes.classTypeId,
      instructorId: classes.instructorId,
      date: classes.date,
      startTime: classes.startTime,
      endTime: classes.endTime,
      capacity: classes.capacity,
      price: classes.price,
      status: classes.status,
      createdAt: classes.createdAt,
      // Joined fields
      classTypeName: classTypes.name,
      instructorName: instructors.name,
      instructorUserProfileId: instructors.userProfileId,
    })
    .from(classes)
    .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
    .leftJoin(instructors, eq(classes.instructorId, instructors.id));

    const results = conditions.length > 0
      ? await baseQuery.where(and(...conditions)).orderBy(asc(classes.date), asc(classes.startTime)).limit(limitNum).offset(offsetNum)
      : await baseQuery.orderBy(asc(classes.date), asc(classes.startTime)).limit(limitNum).offset(offsetNum);

    // Get booking counts for all classes in one query
    const classIds = results.map(r => r.id);
    let bookingCountMap = new Map<number, number>();
    
    if (classIds.length > 0) {
      const bookingCounts = await db
        .select({
          classId: bookings.classId,
          count: sql<number>`count(*)`,
        })
        .from(bookings)
        .where(
          and(
            inArray(bookings.classId, classIds),
            eq(bookings.bookingStatus, 'confirmed')
          )
        )
        .groupBy(bookings.classId);
      
      bookingCounts.forEach(b => {
        bookingCountMap.set(b.classId, Number(b.count));
      });
    }

    // For any instructor without a name, fetch from user profile
    const enrichedResults = await Promise.all(results.map(async (row) => {
      let instructorDisplayName = row.instructorName;
      
      if (!instructorDisplayName && row.instructorUserProfileId) {
        // Fetch user profile and user to get name
        const profileWithUser = await db.select({
          userName: userTable.name,
          userEmail: userTable.email,
        })
        .from(userProfiles)
        .leftJoin(userTable, eq(userProfiles.userId, userTable.id))
        .where(eq(userProfiles.id, row.instructorUserProfileId))
        .limit(1);
        
        if (profileWithUser.length > 0) {
          instructorDisplayName = extractDisplayName(profileWithUser[0].userName, profileWithUser[0].userEmail);
        }
      }
      
      const registeredCount = bookingCountMap.get(row.id) || 0;
      
      return {
        ...row,
        classTypeName: row.classTypeName || 'Unknown Class Type',
        instructorName: instructorDisplayName || 'Unknown Instructor',
        registeredCount,
        spotsRemaining: Math.max(0, row.capacity - registeredCount),
      };
    }));

    return NextResponse.json(enrichedResults, { status: 200 });
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