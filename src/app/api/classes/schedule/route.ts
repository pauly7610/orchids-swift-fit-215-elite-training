import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, classTypes, instructors, bookings, waitlist, userProfiles } from '@/db/schema';
import { eq, and, gte, lte, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get bearer token for user-specific data
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    let currentUserId: string | null = null;
    let studentProfileId: number | null = null;

    // If authenticated, get user profile
    if (token) {
      try {
        const sessionRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
          headers: { cookie: `better-auth.session_token=${token}` }
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          currentUserId = sessionData?.user?.id;
          
          if (currentUserId) {
            const profile = await db.select()
              .from(userProfiles)
              .where(eq(userProfiles.userId, currentUserId))
              .limit(1);
            studentProfileId = profile[0]?.id || null;
          }
        }
      } catch (e) {
        // Continue without user context
      }
    }
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Parse filter parameters
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const instructorId = searchParams.get('instructorId');
    const classTypeId = searchParams.get('classTypeId');
    const status = searchParams.get('status') ?? 'scheduled';
    
    // Build where conditions
    const conditions = [];
    
    // Status filter (default to 'scheduled')
    conditions.push(eq(classes.status, status));
    
    // Date filters
    if (date) {
      conditions.push(eq(classes.date, date));
    } else if (startDate && endDate) {
      conditions.push(gte(classes.date, startDate));
      conditions.push(lte(classes.date, endDate));
    } else {
      // Default: upcoming classes for the next 30 days
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const future = futureDate.toISOString().split('T')[0];
      conditions.push(gte(classes.date, today));
      conditions.push(lte(classes.date, future));
    }
    
    // Instructor filter
    if (instructorId) {
      conditions.push(eq(classes.instructorId, parseInt(instructorId)));
    }
    
    // Class type filter
    if (classTypeId) {
      conditions.push(eq(classes.classTypeId, parseInt(classTypeId)));
    }
    
    // Fetch classes with joins
    const classResults = await db.select({
      id: classes.id,
      date: classes.date,
      startTime: classes.startTime,
      endTime: classes.endTime,
      capacity: classes.capacity,
      status: classes.status,
      price: classes.price,
      classTypeId: classes.classTypeId,
      instructorId: classes.instructorId,
      classTypeName: classTypes.name,
      classTypeDescription: classTypes.description,
      classTypeDuration: classTypes.durationMinutes,
      instructorName: instructors.name,
      instructorBio: instructors.bio,
      instructorHeadshot: instructors.headshotUrl,
    })
      .from(classes)
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .leftJoin(instructors, eq(classes.instructorId, instructors.id))
      .where(and(...conditions))
      .orderBy(asc(classes.date), asc(classes.startTime))
      .limit(limit)
      .offset(offset);
    
    // Enrich with booking counts and user-specific data
    const enrichedClasses = await Promise.all(
      classResults.map(async (cls) => {
        // Count confirmed bookings
        const bookingCounts = await db.select({
          count: sql<number>`count(*)::int`
        })
          .from(bookings)
          .where(
            and(
              eq(bookings.classId, cls.id),
              eq(bookings.bookingStatus, 'confirmed')
            )
          );
        
        const registeredCount = bookingCounts[0]?.count || 0;
        const spotsRemaining = cls.capacity - registeredCount;
        
        // Check if current user has booked this class
        let isUserBooked = false;
        if (studentProfileId) {
          const userBooking = await db.select()
            .from(bookings)
            .where(
              and(
                eq(bookings.classId, cls.id),
                eq(bookings.studentProfileId, studentProfileId),
                eq(bookings.bookingStatus, 'confirmed')
              )
            )
            .limit(1);
          
          isUserBooked = userBooking.length > 0;
        }
        
        // Check waitlist position for current user
        let waitlistPosition: number | null = null;
        if (studentProfileId) {
          const userWaitlist = await db.select()
            .from(waitlist)
            .where(
              and(
                eq(waitlist.classId, cls.id),
                eq(waitlist.studentProfileId, studentProfileId),
                eq(waitlist.status, 'waiting')
              )
            )
            .limit(1);
          
          if (userWaitlist.length > 0) {
            // Calculate position by counting earlier waitlist entries
            const positionResult = await db.select({
              count: sql<number>`count(*)::int`
            })
              .from(waitlist)
              .where(
                and(
                  eq(waitlist.classId, cls.id),
                  eq(waitlist.status, 'waiting'),
                  sql`${waitlist.joinedAt} <= ${userWaitlist[0].joinedAt}`
                )
              );
            
            waitlistPosition = positionResult[0]?.count || 1;
          }
        }
        
        return {
          id: cls.id,
          date: cls.date,
          startTime: cls.startTime,
          endTime: cls.endTime,
          capacity: cls.capacity,
          status: cls.status,
          price: cls.price,
          classType: {
            id: cls.classTypeId,
            name: cls.classTypeName || 'Unknown',
            description: cls.classTypeDescription || '',
            durationMinutes: cls.classTypeDuration || 50
          },
          instructor: {
            id: cls.instructorId,
            name: cls.instructorName || 'Unknown',
            bio: cls.instructorBio || '',
            headshotUrl: cls.instructorHeadshot || ''
          },
          registeredCount,
          spotsRemaining,
          isUserBooked,
          waitlistPosition
        };
      })
    );
    
    return NextResponse.json(enrichedClasses, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}