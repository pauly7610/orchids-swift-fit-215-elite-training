import { db } from '@/db';
import { instructors, userProfiles, user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // First, get existing instructor user profiles
    const existingInstructorProfiles = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.role, 'instructor'));

    console.log(`Found ${existingInstructorProfiles.length} existing instructor profiles`);

    const instructorData = [
        {
            name: 'Joi',
            email: 'joi@posh-studio.com',
            phone: '555-0101',
            bio: 'Certified Mat Pilates instructor with a passion for helping clients build core strength and flexibility. Known for her encouraging teaching style and attention to proper form.',
            specialties: ['Mat Pilates', 'Core Strength', 'Flexibility']
        },
        {
            name: 'Tyra',
            email: 'tyra@posh-studio.com',
            phone: '555-0102',
            bio: 'Dynamic fitness professional specializing in Mat Pilates, strength training, and high-intensity workouts. Brings energy and motivation to every class.',
            specialties: ['Mat Pilates', 'Fitness & Strength Training', 'HIIT']
        },
        {
            name: 'Maisha',
            email: 'maisha@posh-studio.com',
            phone: '555-0103',
            bio: 'Experienced yoga instructor focused on mindfulness, breathwork, and alignment. Creates a calming and supportive environment for all levels.',
            specialties: ['Yoga', 'Mindfulness', 'Breathwork']
        },
        {
            name: 'Nasir',
            email: 'nasir@posh-studio.com',
            phone: '555-0104',
            bio: 'Holistic wellness practitioner specializing in meditation, stress reduction, and herbal wellness. Helps students find balance and inner peace.',
            specialties: ['Meditation & Herbal Wellness', 'Stress Reduction', 'Mindfulness']
        },
        {
            name: 'Drelle',
            email: 'drelle@posh-studio.com',
            phone: '555-0105',
            bio: 'High-energy instructor combining strength training with dance-inspired movement. Makes fitness fun and accessible for everyone.',
            specialties: ['Fitness & Strength Training', 'Dance Fitness', 'Athletic Conditioning']
        },
        {
            name: 'Des',
            email: 'des@posh-studio.com',
            phone: '555-0106',
            bio: 'Professional dancer and fitness instructor who brings joy and rhythm to every workout. Specializes in making cardio fun through dance.',
            specialties: ['Dance Fitness', 'Cardio', 'Choreography']
        }
    ];

    const userProfileIds: number[] = [];

    // Use existing profiles or create new ones
    for (let i = 0; i < instructorData.length; i++) {
        if (i < existingInstructorProfiles.length) {
            // Use existing instructor profile
            userProfileIds.push(existingInstructorProfiles[i].id);
            console.log(`Using existing instructor profile: ${existingInstructorProfiles[i].id}`);
        } else {
            // Create new user and profile
            const instructor = instructorData[i];
            const userId = `instructor_${Date.now()}_${i}`;
            const currentTime = new Date();

            // Create user
            await db.insert(user).values({
                id: userId,
                name: instructor.name,
                email: instructor.email,
                emailVerified: true,
                image: null,
                createdAt: currentTime,
                updatedAt: currentTime
            });

            // Create account for the user
            await db.insert(account).values({
                id: `account_${userId}`,
                accountId: userId,
                providerId: 'credential',
                userId: userId,
                accessToken: null,
                refreshToken: null,
                idToken: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                scope: null,
                password: null,
                createdAt: currentTime,
                updatedAt: currentTime
            });

            // Create user profile
            const [newProfile] = await db.insert(userProfiles).values({
                userId: userId,
                role: 'instructor',
                phone: instructor.phone,
                profileImage: null,
                createdAt: currentTime.toISOString(),
                updatedAt: currentTime.toISOString()
            }).returning();

            userProfileIds.push(newProfile.id);
            console.log(`Created new instructor profile: ${newProfile.id} for ${instructor.name}`);
        }
    }

    // Create instructor records
    const sampleInstructors = instructorData.map((instructor, index) => ({
        userProfileId: userProfileIds[index],
        bio: instructor.bio,
        specialties: JSON.stringify(instructor.specialties),
        headshotUrl: null,
        isActive: true,
        createdAt: new Date().toISOString()
    }));

    await db.insert(instructors).values(sampleInstructors);

    console.log('✅ Instructors seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});