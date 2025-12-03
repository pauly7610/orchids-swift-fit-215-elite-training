import { db } from '@/db';
import { classes, classTypes, instructors, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query database for class types and instructors
    const allClassTypes = await db.select().from(classTypes);
    const allInstructors = await db.select({
        id: instructors.id,
        userProfileId: instructors.userProfileId,
    }).from(instructors);

    // Get user profiles to match instructor names
    const allUserProfiles = await db.select().from(userProfiles);

    // Create a map of instructor names to their IDs
    const instructorMap = new Map<string, number>();
    for (const instructor of allInstructors) {
        const profile = allUserProfiles.find(p => p.id === instructor.userProfileId);
        if (profile) {
            const user = await db.query.user.findFirst({
                where: (users, { eq }) => eq(users.id, profile.userId)
            });
            if (user) {
                instructorMap.set(user.name, instructor.id);
            }
        }
    }

    // Create a map of class type names to their data
    const classTypeMap = new Map<string, { id: number; duration: number }>();
    for (const classType of allClassTypes) {
        classTypeMap.set(classType.name, {
            id: classType.id,
            duration: classType.durationMinutes
        });
    }

    // Helper function to calculate end time
    function calculateEndTime(startTime: string, durationMinutes: number): string {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }

    // Helper function to format date as YYYY-MM-DD
    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Weekly schedule template
    const weeklySchedule = {
        1: [ // Monday
            { time: '06:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '08:00', type: 'Mat Pilates', instructor: 'Tyra' },
            { time: '12:00', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '17:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '18:30', type: 'Yoga', instructor: 'Maisha' },
        ],
        2: [ // Tuesday
            { time: '06:00', type: 'HIIT', instructor: 'Tyra' },
            { time: '09:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '12:00', type: 'Dance Fitness', instructor: 'Des' },
            { time: '17:30', type: 'Fitness & Strength Training', instructor: 'Drelle' },
            { time: '19:00', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
        ],
        3: [ // Wednesday
            { time: '06:00', type: 'Mat Pilates', instructor: 'Tyra' },
            { time: '08:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '12:00', type: 'Yoga', instructor: 'Maisha' },
            { time: '17:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '18:30', type: 'Dance Fitness', instructor: 'Des' },
        ],
        4: [ // Thursday
            { time: '06:00', type: 'HIIT', instructor: 'Tyra' },
            { time: '09:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '12:00', type: 'Fitness & Strength Training', instructor: 'Tyra' },
            { time: '17:30', type: 'Yoga', instructor: 'Maisha' },
            { time: '19:00', type: 'Dance Fitness', instructor: 'Drelle' },
        ],
        5: [ // Friday
            { time: '06:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '08:00', type: 'Mat Pilates', instructor: 'Tyra' },
            { time: '12:00', type: 'Dance Fitness', instructor: 'Des' },
            { time: '17:30', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '18:30', type: 'Meditation & Herbal Wellness', instructor: 'Nasir' },
        ],
        6: [ // Saturday
            { time: '08:00', type: 'Mat Pilates', instructor: 'Joi' },
            { time: '09:00', type: 'Yoga', instructor: 'Maisha' },
            { time: '10:15', type: 'Dance Fitness', instructor: 'Des' },
            { time: '11:15', type: 'HIIT', instructor: 'Tyra' },
        ],
    };

    // Generate classes for the next 14 days (excluding Sundays)
    const sampleClasses = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    
    let daysGenerated = 0;
    let currentDate = new Date(startDate);
    
    while (daysGenerated < 14) {
        const dayOfWeek = currentDate.getDay();
        
        // Skip Sundays (day 0)
        if (dayOfWeek !== 0) {
            const schedule = weeklySchedule[dayOfWeek];
            
            if (schedule) {
                for (const classSession of schedule) {
                    const classTypeData = classTypeMap.get(classSession.type);
                    const instructorId = instructorMap.get(classSession.instructor);
                    
                    if (classTypeData && instructorId) {
                        const endTime = calculateEndTime(classSession.time, classTypeData.duration);
                        
                        sampleClasses.push({
                            classTypeId: classTypeData.id,
                            instructorId: instructorId,
                            date: formatDate(currentDate),
                            startTime: classSession.time,
                            endTime: endTime,
                            capacity: 15,
                            price: 25.00,
                            status: 'scheduled',
                            createdAt: new Date().toISOString(),
                        });
                    }
                }
            }
            
            daysGenerated++;
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    await db.insert(classes).values(sampleClasses);
    
    console.log(`✅ Classes seeder completed successfully - Generated ${sampleClasses.length} classes for the next 2 weeks`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});