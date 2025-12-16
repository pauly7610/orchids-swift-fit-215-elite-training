import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, userProfiles, classes, waitlist } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    // Check authentication and authorization
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins and instructors can mark attendance
    if (profile.role !== 'admin' && profile.role !== 'instructor') {
      return NextResponse.json({ error: 'Only admins and instructors can mark attendance' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['attended', 'no_show', 'confirmed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Verify booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status
    const updated = await db.update(bookings)
      .set({ bookingStatus: status })
      .where(eq(bookings.id, bookingId))
      .returning();

    // If marking as no_show, we could potentially refund credits or take other actions
    // For now, just update the status

    return NextResponse.json({
      ...updated[0],
      message: `Booking marked as ${status}`
    }, { status: 200 });

  } catch (error) {
    console.error('PUT attendance error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

// Bulk update attendance for a class
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (profile.role !== 'admin' && profile.role !== 'instructor') {
      return NextResponse.json({ error: 'Only admins and instructors can mark attendance' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, attendees, noShows } = body;

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    // Verify class exists
    const classExists = await db.select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (classExists.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    let updatedCount = 0;

    // Mark attendees
    if (attendees && Array.isArray(attendees)) {
      for (const bookingId of attendees) {
        await db.update(bookings)
          .set({ bookingStatus: 'attended' })
          .where(eq(bookings.id, bookingId));
        updatedCount++;
      }
    }

    // Mark no-shows
    if (noShows && Array.isArray(noShows)) {
      for (const bookingId of noShows) {
        await db.update(bookings)
          .set({ bookingStatus: 'no_show' })
          .where(eq(bookings.id, bookingId));
        updatedCount++;
      }
    }

    // Update class status to completed if all bookings are processed
    await db.update(classes)
      .set({ status: 'completed' })
      .where(eq(classes.id, classId));

    return NextResponse.json({
      message: `Attendance recorded for ${updatedCount} bookings`,
      updatedCount
    }, { status: 200 });

  } catch (error) {
    console.error('POST attendance error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
