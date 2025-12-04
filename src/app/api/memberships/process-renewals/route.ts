import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases, memberships, payments } from '@/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

interface RenewalResult {
  purchaseId: number;
  studentProfileId: number;
  membershipName: string;
  amount: number;
  status: 'success' | 'failed';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find all membership purchases due for renewal in the next 24 hours
    const purchasesDueForRenewal = await db
      .select()
      .from(studentPurchases)
      .where(
        and(
          eq(studentPurchases.purchaseType, 'membership'),
          eq(studentPurchases.autoRenew, true),
          eq(studentPurchases.isActive, true),
          gte(studentPurchases.expiresAt, now.toISOString()),
          lte(studentPurchases.expiresAt, next24Hours.toISOString())
        )
      );

    const renewals: RenewalResult[] = [];
    let successfulRenewals = 0;
    let failedRenewals = 0;

    // Process each purchase
    for (const purchase of purchasesDueForRenewal) {
      try {
        // Validate required fields
        if (!purchase.membershipId) {
          throw new Error('Purchase missing membershipId');
        }

        // Fetch membership details
        const membershipData = await db
          .select()
          .from(memberships)
          .where(eq(memberships.id, purchase.membershipId))
          .limit(1);

        if (membershipData.length === 0) {
          throw new Error(`Membership with ID ${purchase.membershipId} not found`);
        }

        const membership = membershipData[0];

        // Create new payment record
        const newPayment = await db
          .insert(payments)
          .values({
            studentProfileId: purchase.studentProfileId,
            amount: membership.priceMonthly,
            currency: 'USD',
            paymentMethod: 'square',
            squarePaymentId: `auto_renewal_${Date.now()}_${purchase.id}`,
            status: 'completed',
            paymentDate: now.toISOString(),
            createdAt: now.toISOString(),
          })
          .returning();

        if (newPayment.length === 0) {
          throw new Error('Failed to create payment record');
        }

        // Calculate new dates
        const currentExpiresAt = new Date(purchase.expiresAt!);
        const newExpiresAt = new Date(currentExpiresAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const newNextBillingDate = new Date(newExpiresAt.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Prepare update data
        const updateData: any = {
          expiresAt: newExpiresAt.toISOString(),
          nextBillingDate: newNextBillingDate.toISOString(),
          paymentId: newPayment[0].id,
        };

        // Reset credits if membership has creditsPerMonth
        if (membership.creditsPerMonth) {
          updateData.creditsRemaining = membership.creditsPerMonth;
        }

        // Update the purchase record
        const updatedPurchase = await db
          .update(studentPurchases)
          .set(updateData)
          .where(eq(studentPurchases.id, purchase.id))
          .returning();

        if (updatedPurchase.length === 0) {
          throw new Error('Failed to update purchase record');
        }

        // Record successful renewal
        renewals.push({
          purchaseId: purchase.id,
          studentProfileId: purchase.studentProfileId,
          membershipName: membership.name,
          amount: membership.priceMonthly,
          status: 'success',
        });

        successfulRenewals++;
      } catch (error) {
        // Record failed renewal
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        console.error(`Failed to renew purchase ${purchase.id}:`, errorMessage);

        renewals.push({
          purchaseId: purchase.id,
          studentProfileId: purchase.studentProfileId,
          membershipName: 'Unknown',
          amount: 0,
          status: 'failed',
          error: errorMessage,
        });

        failedRenewals++;
      }
    }

    // Return summary response
    return NextResponse.json({
      totalProcessed: purchasesDueForRenewal.length,
      successfulRenewals,
      failedRenewals,
      renewals,
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'RENEWAL_PROCESS_FAILED',
      },
      { status: 500 }
    );
  }
}