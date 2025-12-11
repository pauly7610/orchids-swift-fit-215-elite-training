import { db } from '@/db';
import { classes, classTypes } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const results = await db.select({
        id: classes.id,
        date: classes.date,
        startTime: classes.startTime,
        endTime: classes.endTime,
        classTypeName: classTypes.name,
    })
    .from(classes)
    .leftJoin(classTypes, eq(classes.classTypeId, classTypes.id))
    .where(eq(classes.date, '2025-12-13'));

    console.log('Classes on December 13, 2025:', results.length);
    results.forEach(c => {
        console.log(`  ${c.startTime} - ${c.endTime}: ${c.classTypeName}`);
    });
}

main().catch(console.error);

