import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waitlist, bookings, classes, userProfiles, user, classTypes } from '@/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendBookingConfirmation } from '@/app/actions/send-booking-emails';

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

// Promote next person from waitlist when a spot opens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, autoPromote = true } = body;

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    // Get class details
    const classData = await db.select({
      id: classes.id,
      date: classes.date,
      startTime: classes.startTime,
      endTime: classes.endTime,
      capacity: classes.capacity,
      classTypeName: classTypes.name,
    })
      .from(classes)
      .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
      .where(eq(classes.id, classId))
      .limit(1);

    if (classData.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const cls = classData[0];

    // Count current confirmed bookings
    const confirmedBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.classId, classId),
          eq(bookings.bookingStatus, 'confirmed')
        )
      );

    const currentBookings = Number(confirmedBookings[0]?.count || 0);
    const spotsAvailable = cls.capacity - currentBookings;

    if (spotsAvailable <= 0) {
      return NextResponse.json({ 
        message: 'No spots available',
        spotsAvailable: 0
      }, { status: 200 });
    }

    // Get next person(s) on waitlist
    const waitlistEntries = await db.select()
      .from(waitlist)
      .where(eq(waitlist.classId, classId))
      .orderBy(asc(waitlist.position))
      .limit(spotsAvailable);

    if (waitlistEntries.length === 0) {
      return NextResponse.json({ 
        message: 'No one on waitlist',
        promoted: 0
      }, { status: 200 });
    }

    const promoted = [];

    for (const entry of waitlistEntries) {
      if (!autoPromote) {
        // Just notify, don't auto-book
        await db.update(waitlist)
          .set({ notified: true })
          .where(eq(waitlist.id, entry.id));
        promoted.push({ id: entry.id, action: 'notified' });
        continue;
      }

      // Auto-promote: Create booking for waitlisted student
      const newBooking = await db.insert(bookings)
        .values({
          classId: classId,
          studentProfileId: entry.studentProfileId,
          bookingStatus: 'confirmed',
          bookedAt: new Date().toISOString(),
          creditsUsed: 0, // Waitlist promotions might be free or use credits - customize as needed
        })
        .returning();

      // Remove from waitlist
      await db.delete(waitlist).where(eq(waitlist.id, entry.id));

      // Get student email for notification
      const studentData = await db.select({
        email: user.email,
        name: user.name,
      })
        .from(userProfiles)
        .leftJoin(user, eq(userProfiles.userId, user.id))
        .where(eq(userProfiles.id, entry.studentProfileId))
        .limit(1);

      if (studentData.length > 0 && studentData[0].email) {
        // Send confirmation email
        try {
          await sendBookingConfirmation({
            studentEmail: studentData[0].email,
            studentName: studentData[0].name || 'Student',
            className: cls.classTypeName || 'Class',
            classDate: cls.date,
            classTime: cls.startTime,
            instructorName: 'Instructor',
            location: '2245 E Tioga Street, Philadelphia, PA 19134',
            creditsUsed: 0,
            cancellationPolicy: 'Please cancel at least 12 hours before class to receive a credit refund.',
          });
        } catch (emailError) {
          console.error('Failed to send waitlist promotion email:', emailError);
        }
      }

      promoted.push({ 
        id: entry.id, 
        bookingId: newBooking[0].id,
        studentProfileId: entry.studentProfileId,
        action: 'promoted'
      });
    }

    // Reorder remaining waitlist positions
    const remainingWaitlist = await db.select()
      .from(waitlist)
      .where(eq(waitlist.classId, classId))
      .orderBy(asc(waitlist.position));

    for (let i = 0; i < remainingWaitlist.length; i++) {
      await db.update(waitlist)
        .set({ position: i + 1 })
        .where(eq(waitlist.id, remainingWaitlist[i].id));
    }

    return NextResponse.json({
      message: `Promoted ${promoted.length} from waitlist`,
      promoted,
      spotsRemaining: spotsAvailable - promoted.length
    }, { status: 200 });

  } catch (error) {
    console.error('Waitlist promote error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
