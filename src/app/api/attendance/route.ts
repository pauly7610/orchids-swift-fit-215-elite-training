import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, userProfiles, classes } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    // Update class status to completed
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
