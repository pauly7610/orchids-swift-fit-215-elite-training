import { db } from '@/db';
import { classes, classTypes, instructors } from '@/db/schema';

async function main() {
    // Get class types and instructors from database
    const classTypesData = await db.select().from(classTypes);
    const instructorsData = await db.select().from(instructors);

    if (classTypesData.length < 2) {
        throw new Error('Need at least 2 class types in the database');
    }
    if (instructorsData.length < 2) {
        throw new Error('Need at least 2 instructors in the database');
    }

    // Helper function to add days to a date
    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Helper function to check if date is a weekday (Mon-Sat)
    const isWeekday = (date: Date): boolean => {
        const day = date.getDay();
        return day >= 1 && day <= 6; // 1 = Monday, 6 = Saturday
    };

    // Generate 10 weekday dates over the next 2 weeks
    const today = new Date();
    const weekdayDates: Date[] = [];
    let currentDate = addDays(today, 1); // Start from tomorrow
    let daysChecked = 0;

    while (weekdayDates.length < 10 && daysChecked < 20) {
        if (isWeekday(currentDate)) {
            weekdayDates.push(new Date(currentDate));
        }
        currentDate = addDays(currentDate, 1);
        daysChecked++;
    }

    // Generate 10 upcoming classes with alternating patterns
    const sampleClasses = weekdayDates.map((date, index) => {
        const classTypeIndex = index % 2;
        const instructorIndex = index % 2;
        const isEarlyClass = index % 2 === 0;
        
        const startTime = isEarlyClass ? '05:00' : '06:30';
        const endTime = isEarlyClass ? '05:50' : '07:20';

        return {
            classTypeId: classTypesData[classTypeIndex].id,
            instructorId: instructorsData[instructorIndex].id,
            date: date.toISOString().split('T')[0],
            startTime: startTime,
            endTime: endTime,
            capacity: 15,
            price: null,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
        };
    });

    await db.insert(classes).values(sampleClasses);
    
    console.log('✅ Classes seeder completed successfully - Created 10 upcoming classes');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});