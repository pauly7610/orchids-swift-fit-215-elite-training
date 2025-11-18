import { db } from '@/db';
import { studentPurchases, userProfiles, packages, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query required data
    const studentProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.role, 'student'))
        .limit(1);

    if (!studentProfile || studentProfile.length === 0) {
        throw new Error('No student profile found. Please seed user_profiles first.');
    }

    const studentProfileId = studentProfile[0].id;

    const allPackages = await db.select().from(packages);
    
    if (!allPackages || allPackages.length === 0) {
        throw new Error('No packages found. Please seed packages first.');
    }

    const tenClassPack = allPackages.find(p => p.name === '10-Class Pack');
    const fiveClassPack = allPackages.find(p => p.name === '5-Class Pack');

    if (!tenClassPack || !fiveClassPack) {
        throw new Error('Required packages not found. Please ensure 10-Class Pack and 5-Class Pack exist.');
    }

    const allPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.studentProfileId, studentProfileId));

    if (!allPayments || allPayments.length < 2) {
        throw new Error('Not enough payment records found. Please seed payments first.');
    }

    // Calculate dates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    const samplePurchases = [
        {
            studentProfileId: studentProfileId,
            purchaseType: 'package',
            packageId: tenClassPack.id,
            membershipId: null,
            creditsRemaining: 7,
            creditsTotal: 10,
            purchasedAt: thirtyDaysAgo.toISOString(),
            expiresAt: thirtyDaysFromNow.toISOString(),
            isActive: true,
            paymentId: allPayments[0].id,
        },
        {
            studentProfileId: studentProfileId,
            purchaseType: 'package',
            packageId: fiveClassPack.id,
            membershipId: null,
            creditsRemaining: 4,
            creditsTotal: 5,
            purchasedAt: fifteenDaysAgo.toISOString(),
            expiresAt: fifteenDaysFromNow.toISOString(),
            isActive: true,
            paymentId: allPayments[1].id,
        },
    ];

    await db.insert(studentPurchases).values(samplePurchases);
    
    console.log('✅ Student purchases seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});