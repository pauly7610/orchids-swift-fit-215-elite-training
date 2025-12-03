import { db } from '@/db';
import { classTypes } from '@/db/schema';

async function main() {
    const sampleClassTypes = [
        {
            name: 'Mat Pilates',
            description: 'Classic Pilates exercises performed on a mat, focusing on core strength, flexibility, and posture. Suitable for all levels.',
            durationMinutes: 50,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Fitness & Strength Training',
            description: 'Full-body strength training combining weights, resistance exercises, and functional movements to build muscle and endurance.',
            durationMinutes: 60,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'HIIT (High-Intensity Interval Training)',
            description: 'High-intensity interval training alternating between intense bursts of activity and fixed periods of less-intense activity or rest. Maximum calorie burn.',
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Yoga',
            description: 'Mind-body practice combining physical postures, breathing techniques, and meditation for flexibility, strength, and relaxation.',
            durationMinutes: 60,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Meditation & Herbal Wellness',
            description: 'Guided meditation and wellness workshop incorporating mindfulness practices and herbal wellness education for stress reduction and inner peace.',
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Dance Fitness',
            description: 'Fun, high-energy cardio workout set to music with easy-to-follow dance choreography. No dance experience required!',
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