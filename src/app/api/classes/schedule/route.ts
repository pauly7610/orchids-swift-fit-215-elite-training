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
    let studentProfileId: number | null = null;

    // If authenticated, get user profile
    if (token) {
      try {
        const profile = await db.select()
          .from(userProfiles)
          .limit(1);
        
        if (profile.length > 0) {
          studentProfileId = profile[0].id;
        }
      } catch (e) {
        console.log('Error getting user profile:', e);
      }
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
      instructorName: instructors.name,
      instructorBio: instructors.bio,
      instructorHeadshot: instructors.headshotUrl,
    })
      .from(classes)
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .leftJoin(instructors, eq(classes.instructorId, instructors.id))
      .where(
        and(
          eq(classes.status, 'scheduled'),
          gte(classes.date, today),
          lte(classes.date, future)
        )
      )
      .orderBy(asc(classes.date), asc(classes.startTime))
      .limit(100);
    
    // Enrich with booking counts
    const enrichedClasses = await Promise.all(
      classResults.map(async (cls) => {
        // Count confirmed bookings
        let registeredCount = 0;
        try {
          const bookingCounts = await db.select({
            count: sql<number>`cast(count(*) as integer)`
          })
            .from(bookings)
            .where(
              and(
                eq(bookings.classId, cls.id),
                eq(bookings.bookingStatus, 'confirmed')
              )
            );
          
          registeredCount = bookingCounts[0]?.count || 0;
        } catch (e) {
          console.error('Error counting bookings:', e);
        }
        
        const spotsRemaining = cls.capacity - registeredCount;
        
        // Check if current user has booked this class
        let isUserBooked = false;
        if (studentProfileId) {
          try {
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
          } catch (e) {
            console.error('Error checking user booking:', e);
          }
        }
        
        // Check waitlist position
        let waitlistPosition: number | null = null;
        if (studentProfileId) {
          try {
            const userWaitlist = await db.select()
              .from(waitlist)
              .where(
                and(
                  eq(waitlist.classId, cls.id),
                  eq(waitlist.studentProfileId, studentProfileId)
                )
              )
              .limit(1);
            
            if (userWaitlist.length > 0) {
              waitlistPosition = userWaitlist[0].position;
            }
          } catch (e) {
            console.error('Error checking waitlist:', e);
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