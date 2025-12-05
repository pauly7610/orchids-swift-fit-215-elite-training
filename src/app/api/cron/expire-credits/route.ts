import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases } from '@/db/schema';
import { and, eq, lt, gt } from 'drizzle-orm';

/**
 * Cron job endpoint to automatically expire old credits
 * 
 * This endpoint should be called periodically (e.g., daily) by a cron service like:
 * - Vercel Cron Jobs
 * - cron-job.org
 * - GitHub Actions
 * 
 * Security: Protect this endpoint with a cron secret token
 * 
 * Example cron schedule:
 * - Daily at midnight: 0 0 * * *
 * - Every 6 hours: 0 [star]/6 * * * (replace [star] with *)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Cron job not configured', code: 'CRON_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    // Check authorization header
    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.warn('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const currentDate = new Date().toISOString();

    // Find all active purchases that have expired
    const expiredPurchases = await db
      .select()
      .from(studentPurchases)
      .where(
        and(
          eq(studentPurchases.isActive, true),
          lt(studentPurchases.expiresAt, currentDate),
          gt(studentPurchases.creditsRemaining, 0) // Only expire if credits remain
        )
      );

    console.log(`Found ${expiredPurchases.length} expired credit purchases to deactivate`);

    // Deactivate expired purchases
    let deactivatedCount = 0;
    const deactivatedDetails = [];

    for (const purchase of expiredPurchases) {
      const result = await db
        .update(studentPurchases)
        .set({
          isActive: false,
        })
        .where(eq(studentPurchases.id, purchase.id))
        .returning();

      if (result.length > 0) {
        deactivatedCount++;
        deactivatedDetails.push({
          purchaseId: purchase.id,
          studentProfileId: purchase.studentProfileId,
          creditsExpired: purchase.creditsRemaining,
          expiresAt: purchase.expiresAt,
        });
      }
    }

    console.log(`Successfully deactivated ${deactivatedCount} expired credit purchases`);

    return NextResponse.json(
      {
        success: true,
        message: `Expired ${deactivatedCount} credit purchase(s)`,
        deactivatedCount,
        details: deactivatedDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility with different cron services
export async function POST(request: NextRequest) {
  return GET(request);
}