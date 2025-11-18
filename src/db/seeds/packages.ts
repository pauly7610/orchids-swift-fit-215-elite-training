import { db } from '@/db';
import { packages } from '@/db/schema';

async function main() {
    const samplePackages = [
        {
            name: '5-Class Pack',
            description: 'Perfect starter pack for new students. Valid for 30 days from purchase.',
            credits: 5,
            price: 75.00,
            expirationDays: 30,
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: '10-Class Pack',
            description: 'Best value package for regular practitioners. Valid for 60 days from purchase.',
            credits: 10,
            price: 140.00,
            expirationDays: 60,
            isActive: true,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(packages).values(samplePackages);
    
    console.log('✅ Packages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});