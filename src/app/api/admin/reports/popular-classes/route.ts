import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, classTypes, instructors, userProfiles } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user role and instructor ID if applicable
    const userProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    if (!userProfile.length) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const role = userProfile[0].role;
    let instructorIdFilter: number | null = null;

    // If instructor, get their instructor ID
    if (role === 'instructor') {
      const instructor = await db
        .select()
        .from(instructors)
        .where(eq(instructors.userProfileId, userProfile[0].id))
        .limit(1);

      if (!instructor.length) {
        return NextResponse.json({ error: 'Instructor record not found' }, { status: 404 });
      }
      instructorIdFilter = instructor[0].id;
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate date parameters
    const endDateParam = searchParams.get('endDate');
    const startDateParam = searchParams.get('startDate');
    const limitParam = searchParams.get('limit');
    
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 10;
    
    // Default to last 30 days if not specified
    const endDate = endDateParam || new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const startDate = startDateParam || defaultStartDate.toISOString().split('T')[0];
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json({ 
        error: "Invalid date format. Use YYYY-MM-DD",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }
    
    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ 
        error: "Start date must be before or equal to end date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Build where conditions
    const whereConditions = [
      gte(classes.date, startDate),
      lte(classes.date, endDate)
    ];

    // Add instructor filter for instructors
    if (role === 'instructor' && instructorIdFilter) {
      whereConditions.push(eq(classes.instructorId, instructorIdFilter));
    }

    // Get top classes with booking counts
    const topClassesQuery = await db
      .select({
        classId: classes.id,
        classTypeId: classes.classTypeId,
        instructorId: classes.instructorId,
        date: classes.date,
        startTime: classes.startTime,
        classTypeName: classTypes.name,
        bookingCount: sql<number>`COUNT(${bookings.id})`,
        confirmedCount: sql<number>`SUM(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 ELSE 0 END)`,
        cancelledCount: sql<number>`SUM(CASE WHEN ${bookings.bookingStatus} IN ('cancelled', 'late_cancel', 'no_show') THEN 1 ELSE 0 END)`
      })
      .from(classes)
      .leftJoin(bookings, eq(classes.id, bookings.classId))
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .where(and(...whereConditions))
      .groupBy(classes.id, classes.classTypeId, classes.instructorId, classes.date, classes.startTime, classTypes.name)
      .orderBy(desc(sql`COUNT(${bookings.id})`))
      .limit(limit);

    // Get top class types with total bookings
    const topClassTypesQuery = await db
      .select({
        classTypeId: classTypes.id,
        classTypeName: classTypes.name,
        totalBookings: sql<number>`COUNT(${bookings.id})`,
        confirmedBookings: sql<number>`SUM(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 ELSE 0 END)`
      })
      .from(classTypes)
      .leftJoin(classes, eq(classTypes.id, classes.classTypeId))
      .leftJoin(bookings, eq(classes.id, bookings.classId))
      .where(and(...whereConditions))
      .groupBy(classTypes.id, classTypes.name)
      .orderBy(desc(sql`COUNT(${bookings.id})`))
      .limit(limit);

    // Get top instructors with total bookings (only if admin)
    let topInstructorsQuery = [];
    if (role === 'admin') {
      topInstructorsQuery = await db
        .select({
          instructorId: instructors.id,
          totalBookings: sql<number>`COUNT(${bookings.id})`,
          confirmedBookings: sql<number>`SUM(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 ELSE 0 END)`,
          classesCount: sql<number>`COUNT(DISTINCT ${classes.id})`
        })
        .from(instructors)
        .leftJoin(classes, eq(instructors.id, classes.instructorId))
        .leftJoin(bookings, eq(classes.id, bookings.classId))
        .where(
          and(
            gte(classes.date, startDate),
            lte(classes.date, endDate)
          )
        )
        .groupBy(instructors.id)
        .orderBy(desc(sql`COUNT(${bookings.id})`))
        .limit(limit);
    }

    // Get most popular time slots
    const popularTimeSlotsQuery = await db
      .select({
        timeSlot: classes.startTime,
        totalBookings: sql<number>`COUNT(${bookings.id})`,
        confirmedBookings: sql<number>`SUM(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 ELSE 0 END)`,
        classesCount: sql<number>`COUNT(DISTINCT ${classes.id})`
      })
      .from(classes)
      .leftJoin(bookings, eq(classes.id, bookings.classId))
      .where(and(...whereConditions))
      .groupBy(classes.startTime)
      .orderBy(desc(sql`COUNT(${bookings.id})`))
      .limit(limit);

    const response: any = {
      topClasses: topClassesQuery.map(cls => ({
        classId: cls.classId,
        classTypeId: cls.classTypeId,
        classTypeName: cls.classTypeName,
        instructorId: cls.instructorId,
        date: cls.date,
        startTime: cls.startTime,
        bookingCount: cls.bookingCount || 0,
        confirmedCount: cls.confirmedCount || 0,
        cancelledCount: cls.cancelledCount || 0
      })),
      topClassTypes: topClassTypesQuery.map(ct => ({
        classTypeId: ct.classTypeId,
        classTypeName: ct.classTypeName,
        totalBookings: ct.totalBookings || 0,
        confirmedBookings: ct.confirmedBookings || 0
      })),
      mostPopularTimeSlots: popularTimeSlotsQuery.map(slot => ({
        timeSlot: slot.timeSlot,
        totalBookings: slot.totalBookings || 0,
        confirmedBookings: slot.confirmedBookings || 0,
        classesCount: slot.classesCount || 0
      })),
      dateRange: {
        startDate,
        endDate
      }
    };

    // Only include instructor rankings for admins
    if (role === 'admin') {
      response.topInstructors = topInstructorsQuery.map(inst => ({
        instructorId: inst.instructorId,
        totalBookings: inst.totalBookings || 0,
        confirmedBookings: inst.confirmedBookings || 0,
        classesCount: inst.classesCount || 0
      }));
    }

    // Add note for instructors
    if (role === 'instructor') {
      response.note = 'Popular classes data shown is for your classes only';
      response.restrictedTo = 'instructor_classes';
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}