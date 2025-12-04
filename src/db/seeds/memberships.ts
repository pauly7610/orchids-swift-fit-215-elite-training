import { db } from '@/db';
import { memberships } from '@/db/schema';

async function main() {
    // Delete existing records first
    await db.delete(memberships);

    const sampleMemberships = [
        {
            name: '4 Class Monthly',
            description: 'Perfect for those with a busy schedule. 4 classes per month with monthly renewal.',
            priceMonthly: 78.00,
            isUnlimited: false,
            creditsPerMonth: 4,
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_6f005263d89019ae3467b7014930bdb7',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: '8 Class Monthly',
            description: 'Great for regular practitioners. 8 classes per month with monthly renewal.',
            priceMonthly: 140.00,
            isUnlimited: false,
            creditsPerMonth: 8,
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_b98d041b9a58327d90aea6dd479ba24b',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Unlimited Monthly',
            description: 'Unlimited access to all classes. Perfect for dedicated students with flexible schedules.',
            priceMonthly: 179.00,
            isUnlimited: true,
            creditsPerMonth: null,
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_f7a2d31d0342eda1b64db8ae9f170cff',
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