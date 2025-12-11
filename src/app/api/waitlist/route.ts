import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waitlist, userProfiles, bookings, classes } from '@/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Helper function to get current user's profile ID
async function getCurrentUserProfileId(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return null;
    }
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 ? profile[0].id : null;
  } catch {
    return null;
  }
}

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
    let studentProfileId = searchParams.get('studentProfileId');
    const notified = searchParams.get('notified');

    // If no studentProfileId provided, get the current user's waitlist entries
    if (!studentProfileId) {
      const currentUserProfileId = await getCurrentUserProfileId();
      if (currentUserProfileId) {
        studentProfileId = currentUserProfileId.toString();
      }
    }

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
    // Get current user's profile ID from session
    const currentUserProfileId = await getCurrentUserProfileId();
    if (!currentUserProfileId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to join the waitlist.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { classId } = body;
    
    // Use the authenticated user's profile ID
    const studentProfileId = currentUserProfileId;

    // Validate required fields
    if (!classId) {
      return NextResponse.json({ 
        error: "classId is required",
        code: "MISSING_CLASS_ID" 
      }, { status: 400 });
    }

    // Validate field types
    if (isNaN(parseInt(classId))) {
      return NextResponse.json({ 
        error: "classId must be a valid integer",
        code: "INVALID_CLASS_ID" 
      }, { status: 400 });
    }

    // Verify the class exists
    const classExists = await db.select()
      .from(classes)
      .where(eq(classes.id, parseInt(classId)))
      .limit(1);

    if (classExists.length === 0) {
      return NextResponse.json({ 
        error: "Class not found",
        code: "CLASS_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if user already has a confirmed booking for this class
    const existingBooking = await db.select()
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, parseInt(classId)),
          eq(bookings.studentProfileId, studentProfileId),
          eq(bookings.bookingStatus, 'confirmed')
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      return NextResponse.json({ 
        error: "You already have a confirmed booking for this class",
        code: "ALREADY_BOOKED" 
      }, { status: 400 });
    }

    // Check if user is already on the waitlist for this class
    const existingWaitlist = await db.select()
      .from(waitlist)
      .where(
        and(
          eq(waitlist.classId, parseInt(classId)),
          eq(waitlist.studentProfileId, studentProfileId)
        )
      )
      .limit(1);

    if (existingWaitlist.length > 0) {
      return NextResponse.json({ 
        error: "You are already on the waitlist for this class",
        code: "ALREADY_ON_WAITLIST",
        position: existingWaitlist[0].position
      }, { status: 400 });
    }

    // Get the current highest position for this class's waitlist
    const maxPositionResult = await db
      .select({ maxPosition: sql<number>`MAX(${waitlist.position})` })
      .from(waitlist)
      .where(eq(waitlist.classId, parseInt(classId)));

    const nextPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;

    // Create new waitlist entry
    const newWaitlistEntry = await db.insert(waitlist)
      .values({
        classId: parseInt(classId),
        studentProfileId: studentProfileId,
        position: nextPosition,
        joinedAt: new Date().toISOString(),
        notified: false,
      })
      .returning();

    return NextResponse.json({
      ...newWaitlistEntry[0],
      message: `Successfully added to waitlist at position ${nextPosition}`
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user's profile ID from session
    const currentUserProfileId = await getCurrentUserProfileId();
    if (!currentUserProfileId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const classId = searchParams.get('classId');

    // Delete by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      // Verify the waitlist entry belongs to the current user
      const entry = await db.select()
        .from(waitlist)
        .where(eq(waitlist.id, parseInt(id)))
        .limit(1);

      if (entry.length === 0) {
        return NextResponse.json({ 
          error: 'Waitlist entry not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      if (entry[0].studentProfileId !== currentUserProfileId) {
        return NextResponse.json({ 
          error: 'You can only remove yourself from the waitlist',
          code: "FORBIDDEN" 
        }, { status: 403 });
      }

      await db.delete(waitlist).where(eq(waitlist.id, parseInt(id)));

      return NextResponse.json({ 
        message: 'Successfully removed from waitlist'
      }, { status: 200 });
    }

    // Delete by classId (remove current user from waitlist for a specific class)
    if (classId) {
      if (isNaN(parseInt(classId))) {
        return NextResponse.json({ 
          error: "Valid classId is required",
          code: "INVALID_CLASS_ID" 
        }, { status: 400 });
      }

      const deleted = await db.delete(waitlist)
        .where(
          and(
            eq(waitlist.classId, parseInt(classId)),
            eq(waitlist.studentProfileId, currentUserProfileId)
          )
        )
        .returning();

      if (deleted.length === 0) {
        return NextResponse.json({ 
          error: 'You are not on the waitlist for this class',
          code: "NOT_ON_WAITLIST" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        message: 'Successfully removed from waitlist'
      }, { status: 200 });
    }

    return NextResponse.json({ 
      error: 'Either id or classId parameter is required',
      code: "MISSING_PARAMETER" 
    }, { status: 400 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
