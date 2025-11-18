import { db } from '@/db';
import { payments, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query student profile to get the ID
    const studentProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.role, 'student'))
        .limit(1);

    if (!studentProfile || studentProfile.length === 0) {
        throw new Error('No student profile found. Please run user profiles seeder first.');
    }

    const studentProfileId = studentProfile[0].id;

    // Generate dates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const samplePayments = [
        {
            studentProfileId: studentProfileId,
            amount: 140.00,
            currency: 'USD',
            paymentMethod: 'square',
            squarePaymentId: 'sq_1a2b3c4d5e6f7g8h9i0j',
            status: 'completed',
            paymentDate: thirtyDaysAgo.toISOString(),
            createdAt: thirtyDaysAgo.toISOString(),
        },
        {
            studentProfileId: studentProfileId,
            amount: 75.00,
            currency: 'USD',
            paymentMethod: 'cash',
            squarePaymentId: null,
            status: 'completed',
            paymentDate: fifteenDaysAgo.toISOString(),
            createdAt: fifteenDaysAgo.toISOString(),
        },
        {
            studentProfileId: studentProfileId,
            amount: 20.00,
            currency: 'USD',
            paymentMethod: 'square',
            squarePaymentId: 'sq_2k3l4m5n6o7p8q9r0s1t',
            status: 'completed',
            paymentDate: sevenDaysAgo.toISOString(),
            createdAt: sevenDaysAgo.toISOString(),
        },
        {
            studentProfileId: studentProfileId,
            amount: 20.00,
            currency: 'USD',
            paymentMethod: 'cash',
            squarePaymentId: null,
            status: 'completed',
            paymentDate: fiveDaysAgo.toISOString(),
            createdAt: fiveDaysAgo.toISOString(),
        },
        {
            studentProfileId: studentProfileId,
            amount: 20.00,
            currency: 'USD',
            paymentMethod: 'square',
            squarePaymentId: 'sq_3u4v5w6x7y8z9a0b1c2d',
            status: 'completed',
            paymentDate: twoDaysAgo.toISOString(),
            createdAt: twoDaysAgo.toISOString(),
        },
    ];

    await db.insert(payments).values(samplePayments);
    
    console.log('✅ Payments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});