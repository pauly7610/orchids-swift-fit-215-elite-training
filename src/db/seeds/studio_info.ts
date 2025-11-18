import { db } from '@/db';
import { studioInfo } from '@/db/schema';

async function main() {
    const sampleStudioInfo = [
        {
            studioName: 'SwiftFit 215',
            logoUrl: null,
            address: '1234 Market Street, Philadelphia, PA 19103',
            phone: '(215) 555-0100',
            email: 'info@swiftfit215.com',
            hours: {
                Monday: '5:00 AM - 8:00 PM',
                Tuesday: '5:00 AM - 8:00 PM',
                Wednesday: '5:00 AM - 8:00 PM',
                Thursday: '5:00 AM - 8:00 PM',
                Friday: '5:00 AM - 8:00 PM',
                Saturday: '7:00 AM - 2:00 PM',
                Sunday: 'Closed'
            },
            cancellationWindowHours: 24,
            lateCancelPenalty: 'lose_credit',
            noShowPenalty: 'lose_credit',
            cancellationPolicyText: 'Classes must be cancelled at least 24 hours in advance to avoid losing your class credit. Late cancellations (less than 24 hours) and no-shows will result in loss of one class credit.',
            refundPolicyText: 'Class packages are non-refundable but can be transferred to another student with studio approval. Memberships can be cancelled with 30 days notice.',
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(studioInfo).values(sampleStudioInfo);
    
    console.log('✅ Studio info seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});