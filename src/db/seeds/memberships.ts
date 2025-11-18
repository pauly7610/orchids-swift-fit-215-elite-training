import { db } from '@/db';
import { memberships } from '@/db/schema';

async function main() {
    const sampleMemberships = [
        {
            name: 'Unlimited Monthly',
            description: 'Unlimited access to all classes. Membership renews monthly and provides unlimited class bookings.',
            priceMonthly: 150.00,
            isUnlimited: true,
            creditsPerMonth: null,
            isActive: true,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(memberships).values(sampleMemberships);
    
    console.log('✅ Memberships seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});