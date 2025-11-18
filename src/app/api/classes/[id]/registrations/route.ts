import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, classes, userProfiles, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid class ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const classId = parseInt(id);

    // Check if class exists
    const classExists = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (classExists.length === 0) {
      return NextResponse.json(
        { 
          error: 'Class not found',
          code: 'CLASS_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const classData = classExists[0];

    // Parse status query parameter
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    
    let statusFilter: string[] = ['confirmed'];
    
    if (statusParam) {
      if (statusParam === 'all') {
        statusFilter = ['confirmed', 'cancelled', 'no_show', 'late_cancel'];
      } else {
        statusFilter = statusParam.split(',').map(s => s.trim());
      }
    }

    // Build query for bookings with student information
    let bookingsQuery = db
      .select({
        id: bookings.id,
        classId: bookings.classId,
        studentProfileId: bookings.studentProfileId,
        bookingStatus: bookings.bookingStatus,
        bookedAt: bookings.bookedAt,
        cancelledAt: bookings.cancelledAt,
        cancellationType: bookings.cancellationType,
        paymentId: bookings.paymentId,
        creditsUsed: bookings.creditsUsed,
        studentName: user.name,
        studentEmail: user.email,
        studentPhone: userProfiles.phone,
        studentProfileImage: userProfiles.profileImage,
      })
      .from(bookings)
      .leftJoin(userProfiles, eq(bookings.studentProfileId, userProfiles.id))
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(
        and(
          eq(bookings.classId, classId),
          inArray(bookings.bookingStatus, statusFilter)
        )
      );

    const results = await bookingsQuery;

    // Count confirmed bookings
    const confirmedBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, classId),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    const confirmedCount = confirmedBookings.length;
    const totalCapacity = classData.capacity;

    return NextResponse.json({
      registrations: results,
      summary: {
        confirmedBookings: confirmedCount,
        totalCapacity: totalCapacity,
        availableSpots: Math.max(0, totalCapacity - confirmedCount),
        totalResults: results.length,
      },
      classInfo: {
        id: classData.id,
        date: classData.date,
        startTime: classData.startTime,
        endTime: classData.endTime,
        status: classData.status,
      }
    });

  } catch (error) {
    console.error('GET class registrations error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}