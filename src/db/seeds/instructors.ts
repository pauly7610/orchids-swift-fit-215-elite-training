import { db } from '@/db';
import { instructors, userProfiles, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // First, get the existing instructor user profile
    const existingInstructorProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.role, 'instructor'))
        .limit(1);

    if (existingInstructorProfile.length === 0) {
        throw new Error('No instructor user profile found. Please run user profiles seeder first.');
    }

    // Create a new user for the second instructor
    const newInstructorUser = await db.insert(user).values({
        id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
        name: 'Alex Rivera',
        email: 'alex.rivera@studio.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    // Create user profile for the new instructor
    const newInstructorProfile = await db.insert(userProfiles).values({
        userId: newInstructorUser[0].id,
        role: 'instructor',
        phone: '555-0124',
        profileImage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    const sampleInstructors = [
        {
            userProfileId: existingInstructorProfile[0].id,
            bio: 'Certified Pilates instructor with over 10 years of experience. Specializes in rehabilitation and athletic performance training.',
            specialties: JSON.stringify(['Mat Pilates', 'Athletic Pilates', 'Rehabilitation', 'Athletic Performance']),
            headshotUrl: null,
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            userProfileId: newInstructorProfile[0].id,
            bio: 'Former professional athlete turned Pilates instructor. Passionate about functional movement and injury prevention.',
            specialties: JSON.stringify(['Athletic Pilates', 'Sports Performance', 'Injury Prevention']),
            headshotUrl: null,
            isActive: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(instructors).values(sampleInstructors);
    
    console.log('✅ Instructors seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});