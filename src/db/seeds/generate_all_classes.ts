import { db } from '@/db';
import { classes, classTypes, instructors, userProfiles, user } from '@/db/schema';
import { eq, gte } from 'drizzle-orm';

/**
 * Generate classes for the next 4 weeks based on the weekly schedule
 * December 13th (soft opening) has special 30-minute classes
 */
async function main() {
    // Get class types
    const allClassTypes = await db.select().from(classTypes);
    const classTypeMap = new Map<string, { id: number; duration: number }>();
    for (const ct of allClassTypes) {
        classTypeMap.set(ct.name, { id: ct.id, duration: ct.durationMinutes });
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

    // Weekly schedule based on the actual schedule from the website
    // Day 0 = Sunday, 1 = Monday, etc.
    // NOTE: Joi's classes are 5:30am-6:30am, Nasir removed from Wednesdays
    const weeklySchedule: { [key: number]: Array<{ time: string; type: string; instructor: string }> } = {
        1: [ // Monday
            { time: '05:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '11:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '16:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
            { time: '19:00', type: 'Dance Fitness', instructor: 'Ivori' },
        ],
        2: [ // Tuesday
            { time: '05:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '09:15', type: 'Yoga', instructor: 'Life' },
            { time: '11:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
        ],
        3: [ // Wednesday - Nasir REMOVED from this day
            { time: '05:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '13:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '17:00', type: 'Fitness & Strength Training', instructor: 'Jewlz' },
            { time: '18:30', type: 'Dance Fitness', instructor: 'Des' },
            { time: '20:00', type: 'Dance Fitness', instructor: 'Ivori' },
        ],
        4: [ // Thursday
            { time: '05:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '09:15', type: 'Yoga', instructor: 'Life' },
            { time: '11:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '18:00', type: 'Dance Fitness', instructor: 'Des' },
            { time: '19:30', type: 'Dance Fitness', instructor: 'Ivori' },
        ],
        5: [ // Friday
            { time: '05:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '11:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '16:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
        ],
        6: [ // Saturday (regular schedule starting Dec 15)
            { time: '08:00', type: 'HIIT (High-Intensity Interval Training)', instructor: 'Tyra' },
            { time: '10:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
            { time: '11:45', type: 'Dance Fitness', instructor: 'Des' },
            { time: '13:30', type: 'Fitness & Strength Training', instructor: 'Drelle' },
        ],
        0: [ // Sunday
            { time: '08:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
            { time: '10:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '12:00', type: 'Dance Fitness', instructor: 'Des' },
        ],
    };

    // Dates where Nasir is excluded (Jan 16-19, 2026)
    const nasirExcludedDates = ['2026-01-16', '2026-01-17', '2026-01-18', '2026-01-19'];
    
    // Dates where Des (Desiree) is excluded (Dec 20, 2025)
    const desExcludedDates = ['2025-12-20'];

    // Soft opening schedule for December 13th (30-minute classes)
    const softOpeningSchedule = [
        { time: '09:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir', duration: 30 },
        { time: '10:00', type: 'Dance Fitness', instructor: 'Des', duration: 30 },
        { time: '11:00', type: 'Fitness & Strength Training', instructor: 'Drelle', duration: 30 },
        { time: '12:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir', duration: 30 },
    ];

    // Helper to calculate end time
    function calculateEndTime(startTime: string, durationMinutes: number): string {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }

    // Helper to format date
    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Delete ALL classes to start fresh
    await db.delete(classes);
    console.log('Deleted all existing classes');

    const classesToInsert = [];
    
    // SOFT OPENING: December 13, 2025 (special 30-minute free classes)
    const softOpeningDate = '2025-12-13';
    for (const classSession of softOpeningSchedule) {
        const classTypeData = classTypeMap.get(classSession.type);
        const instructorId = instructorMap.get(classSession.instructor);

        if (classTypeData && instructorId) {
            const endTime = calculateEndTime(classSession.time, classSession.duration);
            classesToInsert.push({
                classTypeId: classTypeData.id,
                instructorId: instructorId,
                date: softOpeningDate,
                startTime: classSession.time,
                endTime: endTime,
                capacity: 50, // Larger capacity for soft opening
                price: 0, // Free for soft opening
                status: 'scheduled',
                createdAt: new Date().toISOString(),
            });
        }
    }
    console.log(`Added ${classesToInsert.length} soft opening classes for Dec 13`);

    // REGULAR SCHEDULE: Starts December 15, 2025 (6 weeks)
    const regularStartDate = new Date('2025-12-15');
    
    for (let dayOffset = 0; dayOffset < 42; dayOffset++) {
        const currentDate = new Date(regularStartDate);
        currentDate.setDate(regularStartDate.getDate() + dayOffset);
        const dateStr = formatDate(currentDate);
        const dayOfWeek = currentDate.getDay();

        // Regular schedule
        const schedule = weeklySchedule[dayOfWeek];
        if (schedule) {
            for (const classSession of schedule) {
                // Skip Nasir on excluded dates (Jan 16-19, 2026)
                if (classSession.instructor === 'Nasir' && nasirExcludedDates.includes(dateStr)) {
                    console.log(`⚠️ Skipping Nasir's class on ${dateStr} (excluded date)`);
                    continue;
                }
                
                // Skip Des (Desiree) on excluded dates (Dec 20, 2025)
                if (classSession.instructor === 'Des' && desExcludedDates.includes(dateStr)) {
                    console.log(`⚠️ Skipping Des's class on ${dateStr} (excluded date)`);
                    continue;
                }

                const classTypeData = classTypeMap.get(classSession.type);
                const instructorId = instructorMap.get(classSession.instructor);

                if (classTypeData && instructorId) {
                    const endTime = calculateEndTime(classSession.time, classTypeData.duration);
                    classesToInsert.push({
                        classTypeId: classTypeData.id,
                        instructorId: instructorId,
                        date: dateStr,
                        startTime: classSession.time,
                        endTime: endTime,
                        capacity: 15, // Regular capacity
                        price: 25.00, // Regular price
                        status: 'scheduled',
                        createdAt: new Date().toISOString(),
                    });
                } else {
                    if (!classTypeData) console.warn(`⚠️ Class type not found: ${classSession.type}`);
                    if (!instructorId) console.warn(`⚠️ Instructor not found: ${classSession.instructor}`);
                }
            }
        }
    }

    if (classesToInsert.length > 0) {
        // Insert in batches to avoid issues
        const batchSize = 50;
        for (let i = 0; i < classesToInsert.length; i += batchSize) {
            const batch = classesToInsert.slice(i, i + batchSize);
            await db.insert(classes).values(batch);
        }
        console.log(`✅ Generated ${classesToInsert.length} classes for the next 6 weeks`);
    } else {
        console.error('❌ No classes were generated - check class types and instructor names');
    }
}

main().catch((error) => {
    console.error('❌ Class generation failed:', error);
});

