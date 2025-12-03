import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, classTypes, instructors } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Default: upcoming classes for the next 30 days
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const future = futureDate.toISOString().split('T')[0];
    
    console.log('Fetching classes from', today, 'to', future);
    
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
    
    console.log('Found', classResults.length, 'classes');
    
    // Transform to simple format
    const enrichedClasses = classResults.map((cls) => ({
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
        bio: '',
        headshotUrl: ''
      },
      registeredCount: 0,
      spotsRemaining: cls.capacity,
      isUserBooked: false,
      waitlistPosition: null
    }));
    
    return NextResponse.json(enrichedClasses, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}