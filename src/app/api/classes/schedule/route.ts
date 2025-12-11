import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, classTypes, instructors, userProfiles, user, bookings, waitlist } from '@/db/schema';
import { eq, and, gte, lte, asc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Try to get current user (optional - schedule is public)
    let currentUserProfileId: number | null = null;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        // Get the user's profile ID
        const profile = await db.select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, session.user.id))
          .limit(1);
        if (profile.length > 0) {
          currentUserProfileId = profile[0].id;
        }
      }
    } catch {
      // User not authenticated - that's fine for schedule viewing
    }

    // Default: upcoming classes for the next 30 days
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const future = futureDate.toISOString().split('T')[0];
    
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
      instructorName: user.name,
      instructorBio: instructors.bio,
      instructorHeadshot: instructors.headshotUrl,
    })
      .from(classes)
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .leftJoin(instructors, eq(classes.instructorId, instructors.id))
      .leftJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(
        and(
          eq(classes.status, 'scheduled'),
          gte(classes.date, today),
          lte(classes.date, future)
        )
      )
      .orderBy(asc(classes.date), asc(classes.startTime))
      .limit(100);
    
    // Get booking counts for all classes
    const classIds = classResults.map(c => c.id);
    
    // Get confirmed booking counts per class
    const bookingCounts = await db
      .select({
        classId: bookings.classId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(bookings)
      .where(
        and(
          sql`${bookings.classId} IN (${classIds.length > 0 ? classIds.join(',') : '0'})`,
          eq(bookings.bookingStatus, 'confirmed')
        )
      )
      .groupBy(bookings.classId);
    
    // Create a map of classId -> booking count
    const bookingCountMap = new Map<number, number>();
    bookingCounts.forEach(b => {
      bookingCountMap.set(b.classId, Number(b.count));
    });
    
    // If user is logged in, get their bookings and waitlist positions
    const userBookedClassIds = new Set<number>();
    const userWaitlistPositions = new Map<number, number>();
    
    if (currentUserProfileId) {
      // Get user's confirmed bookings
      const userBookings = await db
        .select({ classId: bookings.classId })
        .from(bookings)
        .where(
          and(
            eq(bookings.studentProfileId, currentUserProfileId),
            eq(bookings.bookingStatus, 'confirmed'),
            sql`${bookings.classId} IN (${classIds.length > 0 ? classIds.join(',') : '0'})`
          )
        );
      
      userBookings.forEach(b => userBookedClassIds.add(b.classId));
      
      // Get user's waitlist positions
      const userWaitlists = await db
        .select({ classId: waitlist.classId, position: waitlist.position })
        .from(waitlist)
        .where(
          and(
            eq(waitlist.studentProfileId, currentUserProfileId),
            sql`${waitlist.classId} IN (${classIds.length > 0 ? classIds.join(',') : '0'})`
          )
        );
      
      userWaitlists.forEach(w => userWaitlistPositions.set(w.classId, w.position));
    }
    
    // Transform to enriched format with real data
    const enrichedClasses = classResults.map((cls) => {
      const registeredCount = bookingCountMap.get(cls.id) || 0;
      const spotsRemaining = Math.max(0, cls.capacity - registeredCount);
      
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
        isUserBooked: userBookedClassIds.has(cls.id),
        waitlistPosition: userWaitlistPositions.get(cls.id) || null
      };
    });
    
    return NextResponse.json(enrichedClasses, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
