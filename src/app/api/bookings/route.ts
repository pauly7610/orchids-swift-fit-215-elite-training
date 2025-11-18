import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // List with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentProfileId = searchParams.get('studentProfileId');
    const classId = searchParams.get('classId');
    const bookingStatus = searchParams.get('bookingStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select().from(bookings);

    const conditions = [];

    if (studentProfileId) {
      const profileId = parseInt(studentProfileId);
      if (!isNaN(profileId)) {
        conditions.push(eq(bookings.studentProfileId, profileId));
      }
    }

    if (classId) {
      const cId = parseInt(classId);
      if (!isNaN(cId)) {
        conditions.push(eq(bookings.classId, cId));
      }
    }

    if (bookingStatus) {
      const validStatuses = ['confirmed', 'cancelled', 'no_show', 'late_cancel'];
      if (validStatuses.includes(bookingStatus)) {
        conditions.push(eq(bookings.bookingStatus, bookingStatus));
      }
    }

    if (startDate) {
      conditions.push(gte(bookings.bookedAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(bookings.bookedAt, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, studentProfileId, bookingStatus, cancelledAt, cancellationType, paymentId, creditsUsed } = body;

    // Validate required fields
    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required', code: 'MISSING_CLASS_ID' },
        { status: 400 }
      );
    }

    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required', code: 'MISSING_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate field types
    if (isNaN(parseInt(classId))) {
      return NextResponse.json(
        { error: 'classId must be a valid integer', code: 'INVALID_CLASS_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(studentProfileId))) {
      return NextResponse.json(
        { error: 'studentProfileId must be a valid integer', code: 'INVALID_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate bookingStatus if provided
    if (bookingStatus) {
      const validStatuses = ['confirmed', 'cancelled', 'no_show', 'late_cancel'];
      if (!validStatuses.includes(bookingStatus)) {
        return NextResponse.json(
          { error: 'bookingStatus must be one of: confirmed, cancelled, no_show, late_cancel', code: 'INVALID_BOOKING_STATUS' },
          { status: 400 }
        );
      }
    }

    // Validate paymentId if provided
    if (paymentId !== undefined && paymentId !== null && isNaN(parseInt(paymentId))) {
      return NextResponse.json(
        { error: 'paymentId must be a valid integer', code: 'INVALID_PAYMENT_ID' },
        { status: 400 }
      );
    }

    // Validate creditsUsed if provided
    if (creditsUsed !== undefined && creditsUsed !== null && isNaN(parseInt(creditsUsed))) {
      return NextResponse.json(
        { error: 'creditsUsed must be a valid integer', code: 'INVALID_CREDITS_USED' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      classId: parseInt(classId),
      studentProfileId: parseInt(studentProfileId),
      bookingStatus: bookingStatus || 'confirmed',
      bookedAt: new Date().toISOString(),
      creditsUsed: creditsUsed !== undefined && creditsUsed !== null ? parseInt(creditsUsed) : 0,
    };

    if (cancelledAt) {
      insertData.cancelledAt = cancelledAt;
    }

    if (cancellationType) {
      insertData.cancellationType = cancellationType;
    }

    if (paymentId !== undefined && paymentId !== null) {
      insertData.paymentId = parseInt(paymentId);
    }

    const newBooking = await db.insert(bookings).values(insertData).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}