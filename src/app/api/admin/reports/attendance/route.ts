import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes } from '@/db/schema';
import { eq, and, gte, lte, sql, count, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate date parameters
    const endDateParam = searchParams.get('endDate');
    const startDateParam = searchParams.get('startDate');
    
    // Default to today for endDate
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date();
    
    // Default to 30 days ago for startDate
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : defaultStartDate;
    
    // Validate dates
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ 
        error: "Invalid start date format. Use YYYY-MM-DD",
        code: "INVALID_START_DATE" 
      }, { status: 400 });
    }
    
    if (isNaN(endDate.getTime())) {
      return NextResponse.json({ 
        error: "Invalid end date format. Use YYYY-MM-DD",
        code: "INVALID_END_DATE" 
      }, { status: 400 });
    }
    
    if (startDate > endDate) {
      return NextResponse.json({ 
        error: "Start date must be before or equal to end date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }
    
    // Format dates as ISO strings for comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get all bookings in date range by joining with classes
    const allBookingsInRange = await db
      .select({
        bookingId: bookings.id,
        bookingStatus: bookings.bookingStatus,
        classId: bookings.classId,
        classDate: classes.date,
        classStatus: classes.status,
      })
      .from(bookings)
      .innerJoin(classes, eq(bookings.classId, classes.id))
      .where(
        and(
          gte(classes.date, startDateStr),
          lte(classes.date, endDateStr)
        )
      );
    
    // Calculate statistics
    const totalBookings = allBookingsInRange.length;
    
    const confirmedBookings = allBookingsInRange.filter(
      b => b.bookingStatus === 'confirmed'
    ).length;
    
    const cancelledBookings = allBookingsInRange.filter(
      b => b.bookingStatus === 'cancelled' || b.bookingStatus === 'late_cancel'
    ).length;
    
    const noShows = allBookingsInRange.filter(
      b => b.bookingStatus === 'no_show'
    ).length;
    
    // Get unique classes that have bookings and count completed ones
    const uniqueClassIds = [...new Set(allBookingsInRange.map(b => b.classId))];
    const completedClasses = allBookingsInRange.filter(
      (b, index, self) => 
        b.classStatus === 'completed' && 
        self.findIndex(item => item.classId === b.classId) === index
    ).length;
    
    // Calculate rates
    const attendanceRate = totalBookings > 0 
      ? ((confirmedBookings / totalBookings) * 100).toFixed(2)
      : '0.00';
    
    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
      : '0.00';
    
    const noShowRate = totalBookings > 0 
      ? ((noShows / totalBookings) * 100).toFixed(2)
      : '0.00';
    
    // Calculate average bookings per class
    const averageBookingsPerClass = uniqueClassIds.length > 0 
      ? (totalBookings / uniqueClassIds.length).toFixed(2)
      : '0.00';
    
    // Return statistics
    return NextResponse.json({
      totalBookings,
      completedClasses,
      cancelledBookings,
      noShows,
      attendanceRate: parseFloat(attendanceRate),
      cancellationRate: parseFloat(cancellationRate),
      noShowRate: parseFloat(noShowRate),
      averageBookingsPerClass: parseFloat(averageBookingsPerClass),
      dateRange: {
        startDate: startDateStr,
        endDate: endDateStr
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('GET attendance statistics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}