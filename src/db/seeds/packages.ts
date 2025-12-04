import { db } from '@/db';
import { packages } from '@/db/schema';

async function main() {
    // Delete existing records first
    await db.delete(packages);

    const samplePackages = [
        {
            name: 'New Student Intro',
            description: 'Special introductory offer for new students. 3 classes to try out the studio.',
            credits: 3,
            price: 49.00,
            expirationDays: 30,
            validityType: 'none',
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_3170cae99f12bdf4946fbad2f0115779',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Drop In',
            description: 'Single class drop-in rate. Valid for one class on the day of purchase.',
            credits: 1,
            price: 22.00,
            expirationDays: 1,
            validityType: 'none',
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_2fbdf3a609891ea262e844eb8ecd6d0d',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: '5 Class Pack',
            description: 'Perfect for regular practitioners. Valid for one year from purchase.',
            credits: 5,
            price: 100.00,
            expirationDays: 365,
            validityType: 'none',
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_31523cd29d05b93f5914fa3810d6d222',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: '10 Class Pack',
            description: 'Best value for committed students. Annual validity with automatic renewal tracking.',
            credits: 10,
            price: 190.00,
            expirationDays: 365,
            validityType: 'annual',
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_05d3b78c3d0a693475d54f08edddeaa0',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: '20 Class Pack',
            description: 'Ultimate value pack for dedicated practitioners. Annual validity with automatic renewal tracking.',
            credits: 20,
            price: 360.00,
            expirationDays: 365,
            validityType: 'annual',
            swipeSimpleLink: 'https://swipesimple.com/links/lnk_e67ae0c539f9ef0c8b2715cc6a058d5a',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(packages).values(samplePackages);
    
    console.log('✅ Packages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});