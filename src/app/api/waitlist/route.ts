import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waitlist } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(waitlist)
        .where(eq(waitlist.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Waitlist record not found',
          code: "RECORD_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const classId = searchParams.get('classId');
    const studentProfileId = searchParams.get('studentProfileId');
    const notified = searchParams.get('notified');

    let query = db.select().from(waitlist);

    // Build filter conditions
    const conditions = [];
    if (classId) {
      if (isNaN(parseInt(classId))) {
        return NextResponse.json({ 
          error: "Valid classId is required",
          code: "INVALID_CLASS_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(waitlist.classId, parseInt(classId)));
    }
    if (studentProfileId) {
      if (isNaN(parseInt(studentProfileId))) {
        return NextResponse.json({ 
          error: "Valid studentProfileId is required",
          code: "INVALID_STUDENT_PROFILE_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(waitlist.studentProfileId, parseInt(studentProfileId)));
    }
    if (notified !== null && notified !== undefined) {
      const notifiedValue = notified === 'true';
      conditions.push(eq(waitlist.notified, notifiedValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(asc(waitlist.position))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, studentProfileId, position, notified } = body;

    // Validate required fields
    if (!classId) {
      return NextResponse.json({ 
        error: "classId is required",
        code: "MISSING_CLASS_ID" 
      }, { status: 400 });
    }

    if (!studentProfileId) {
      return NextResponse.json({ 
        error: "studentProfileId is required",
        code: "MISSING_STUDENT_PROFILE_ID" 
      }, { status: 400 });
    }

    if (position === undefined || position === null) {
      return NextResponse.json({ 
        error: "position is required",
        code: "MISSING_POSITION" 
      }, { status: 400 });
    }

    // Validate field types
    if (isNaN(parseInt(classId))) {
      return NextResponse.json({ 
        error: "classId must be a valid integer",
        code: "INVALID_CLASS_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(studentProfileId))) {
      return NextResponse.json({ 
        error: "studentProfileId must be a valid integer",
        code: "INVALID_STUDENT_PROFILE_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(position))) {
      return NextResponse.json({ 
        error: "position must be a valid integer",
        code: "INVALID_POSITION" 
      }, { status: 400 });
    }

    // Create new waitlist entry
    const newWaitlistEntry = await db.insert(waitlist)
      .values({
        classId: parseInt(classId),
        studentProfileId: parseInt(studentProfileId),
        position: parseInt(position),
        joinedAt: new Date().toISOString(),
        notified: notified !== undefined ? Boolean(notified) : false,
      })
      .returning();

    return NextResponse.json(newWaitlistEntry[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}