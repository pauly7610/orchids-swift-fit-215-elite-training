import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, classTypes, instructors, userProfiles, user, payments } from '@/db/schema';
import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function getCurrentUserProfile() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return null;
    }
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 ? profile[0] : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get all instructors with their booking counts and revenue
    const instructorStats = await db
      .select({
        instructorId: instructors.id,
        instructorName: sql<string>`COALESCE(${instructors.name}, ${user.name}, 'Unknown')`,
        instructorEmail: user.email,
        headshotUrl: instructors.headshotUrl,
      })
      .from(instructors)
      .leftJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(instructors.isActive, true));

    // Get booking stats per instructor
    const results = await Promise.all(instructorStats.map(async (instructor) => {
      // Build conditions for this instructor's classes
      const conditions: any[] = [eq(classes.instructorId, instructor.instructorId)];
      if (startDate) {
        conditions.push(gte(classes.date, startDate));
      }
      if (endDate) {
        conditions.push(lte(classes.date, endDate));
      }

      // Get classes taught by this instructor
      const instructorClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(and(...conditions));
      const classIds = instructorClasses.map(c => c.id);

      if (classIds.length === 0) {
        return {
          ...instructor,
          totalClasses: 0,
          totalBookings: 0,
          totalAttended: 0,
          totalNoShows: 0,
          attendanceRate: 0,
          totalCreditsUsed: 0,
          avgBookingsPerClass: 0,
        };
      }

      // Get booking stats for these classes
      const bookingStats = await db
        .select({
          totalBookings: sql<number>`count(*)`,
          totalAttended: sql<number>`sum(case when ${bookings.bookingStatus} = 'attended' then 1 else 0 end)`,
          totalNoShows: sql<number>`sum(case when ${bookings.bookingStatus} = 'no_show' then 1 else 0 end)`,
          totalConfirmed: sql<number>`sum(case when ${bookings.bookingStatus} = 'confirmed' then 1 else 0 end)`,
          totalCreditsUsed: sql<number>`sum(${bookings.creditsUsed})`,
        })
        .from(bookings)
        .where(inArray(bookings.classId, classIds));

      const stats = bookingStats[0];
      const totalBookings = Number(stats?.totalBookings || 0);
      const totalAttended = Number(stats?.totalAttended || 0);
      const totalNoShows = Number(stats?.totalNoShows || 0);
      const totalConfirmed = Number(stats?.totalConfirmed || 0);
      const totalCreditsUsed = Number(stats?.totalCreditsUsed || 0);

      // Attendance rate based on completed bookings (attended + no_shows)
      const completedBookings = totalAttended + totalNoShows;
      const attendanceRate = completedBookings > 0 
        ? Math.round((totalAttended / completedBookings) * 100) 
        : 0;

      return {
        ...instructor,
        totalClasses: classIds.length,
        totalBookings,
        totalAttended,
        totalNoShows,
        totalConfirmed,
        attendanceRate,
        totalCreditsUsed,
        avgBookingsPerClass: classIds.length > 0 
          ? Math.round((totalBookings / classIds.length) * 10) / 10 
          : 0,
      };
    }));

    // Sort by total bookings descending
    results.sort((a, b) => b.totalBookings - a.totalBookings);

    // Calculate totals
    const totals = {
      totalInstructors: results.length,
      totalClasses: results.reduce((sum, r) => sum + r.totalClasses, 0),
      totalBookings: results.reduce((sum, r) => sum + r.totalBookings, 0),
      totalAttended: results.reduce((sum, r) => sum + r.totalAttended, 0),
      totalNoShows: results.reduce((sum, r) => sum + r.totalNoShows, 0),
      totalCreditsUsed: results.reduce((sum, r) => sum + r.totalCreditsUsed, 0),
      overallAttendanceRate: (() => {
        const attended = results.reduce((sum, r) => sum + r.totalAttended, 0);
        const noShows = results.reduce((sum, r) => sum + r.totalNoShows, 0);
        const completed = attended + noShows;
        return completed > 0 ? Math.round((attended / completed) * 100) : 0;
      })(),
    };

    return NextResponse.json({
      instructors: results,
      totals,
      dateRange: {
        startDate: startDate || 'all time',
        endDate: endDate || 'present',
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Instructor revenue report error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
