import { db } from '@/db';
import { bookings, userProfiles, classes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

async function main() {
    // Query student profile
    const studentProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.role, 'student'))
        .limit(1);

    if (!studentProfile.length) {
        throw new Error('No student profile found. Please seed user profiles first.');
    }

    const studentProfileId = studentProfile[0].id;

    // Query first 5 upcoming classes
    const upcomingClasses = await db
        .select()
        .from(classes)
        .orderBy(asc(classes.date))
        .limit(5);

    if (upcomingClasses.length < 5) {
        throw new Error('Not enough classes found. Please seed classes first.');
    }

    const sampleBookings = [
        {
            classId: upcomingClasses[0].id,
            studentProfileId: studentProfileId,
            bookingStatus: 'confirmed',
            bookedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
            cancellationType: null,
            paymentId: null,
            creditsUsed: 1,
        },
        {
            classId: upcomingClasses[1].id,
            studentProfileId: studentProfileId,
            bookingStatus: 'confirmed',
            bookedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
            cancellationType: null,
            paymentId: null,
            creditsUsed: 1,
        },
        {
            classId: upcomingClasses[2].id,
            studentProfileId: studentProfileId,
            bookingStatus: 'confirmed',
            bookedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
            cancellationType: null,
            paymentId: null,
            creditsUsed: 1,
        },
        {
            classId: upcomingClasses[3].id,
            studentProfileId: studentProfileId,
            bookingStatus: 'confirmed',
            bookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
            cancellationType: null,
            paymentId: null,
            creditsUsed: 1,
        },
        {
            classId: upcomingClasses[4].id,
            studentProfileId: studentProfileId,
            bookingStatus: 'confirmed',
            bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
            cancellationType: null,
            paymentId: null,
            creditsUsed: 1,
        },
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});