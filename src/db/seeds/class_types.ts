import { db } from '@/db';
import { classTypes } from '@/db/schema';

async function main() {
    const sampleClassTypes = [
        {
            name: 'Mat Pilates',
            description: 'Classic Pilates exercises performed on a mat, focusing on core strength, flexibility, and posture',
            durationMinutes: 50,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Athletic Pilates',
            description: 'High-intensity Pilates class combining traditional movements with athletic conditioning for a full-body workout',
            durationMinutes: 50,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(classTypes).values(sampleClassTypes);
    
    console.log('✅ Class types seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});