import { db } from '@/db';
import { classes, classTypes, instructors, userProfiles, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed script for December 13th, 2025 Soft Opening Classes
 * All classes on this day are 30 minutes
 */
async function main() {
    // Get class types
    const allClassTypes = await db.select().from(classTypes);
    const classTypeMap = new Map<string, number>();
    for (const ct of allClassTypes) {
        classTypeMap.set(ct.name, ct.id);
    }

    // Get instructors with their names
    const allInstructors = await db.select({
        id: instructors.id,
        userProfileId: instructors.userProfileId,
    }).from(instructors);

    const allUserProfiles = await db.select().from(userProfiles);
    const allUsers = await db.select().from(user);

    const instructorMap = new Map<string, number>();
    for (const instructor of allInstructors) {
        const profile = allUserProfiles.find(p => p.id === instructor.userProfileId);
        if (profile) {
            const userData = allUsers.find(u => u.id === profile.userId);
            if (userData) {
                instructorMap.set(userData.name, instructor.id);
            }
        }
    }

    // Soft Opening Schedule - December 13, 2025
    // All classes are 30 minutes
    const softOpeningDate = '2025-12-13';
    const classDuration = 30; // 30 minutes for soft opening

    const softOpeningClasses = [
        {
            startTime: '09:00',
            endTime: '09:30',
            type: 'Meditation & Herbal Wellness',
            instructor: 'Nasir',
        },
        {
            startTime: '10:00',
            endTime: '10:30',
            type: 'Dance Fitness',
            instructor: 'Des',
        },
        {
            startTime: '11:00',
            endTime: '11:30',
            type: 'Fitness & Strength Training',
            instructor: 'Drelle',
        },
        {
            startTime: '12:00',
            endTime: '12:30',
            type: 'Meditation & Herbal Wellness',
            instructor: 'Nasir',
        },
    ];

    // Delete any existing classes on December 13th to avoid duplicates
    await db.delete(classes).where(eq(classes.date, softOpeningDate));

    const classesToInsert = [];
    
    for (const classSession of softOpeningClasses) {
        const classTypeId = classTypeMap.get(classSession.type);
        const instructorId = instructorMap.get(classSession.instructor);

        if (classTypeId && instructorId) {
            classesToInsert.push({
                classTypeId: classTypeId,
                instructorId: instructorId,
                date: softOpeningDate,
                startTime: classSession.startTime,
                endTime: classSession.endTime,
                capacity: 50, // Larger capacity for soft opening
                price: 0, // Free for soft opening
                status: 'scheduled',
                createdAt: new Date().toISOString(),
            });
        } else {
            console.warn(`⚠️ Could not find class type "${classSession.type}" or instructor "${classSession.instructor}"`);
        }
    }

    if (classesToInsert.length > 0) {
        await db.insert(classes).values(classesToInsert);
        console.log(`✅ Soft Opening classes seeded successfully - ${classesToInsert.length} classes for December 13, 2025 (30 min each)`);
    } else {
        console.error('❌ No classes were inserted - check class types and instructor names');
    }
}

main().catch((error) => {
    console.error('❌ Soft opening seeder failed:', error);
});

