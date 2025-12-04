import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate ID parameter
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid purchase ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const purchaseId = parseInt(id);

    // Fetch the purchase by ID
    const purchase = await db
      .select()
      .from(studentPurchases)
      .where(eq(studentPurchases.id, purchaseId))
      .limit(1);

    if (purchase.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found', code: 'PURCHASE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentPurchase = purchase[0];

    // Verify purchase type is 'membership'
    if (currentPurchase.purchaseType !== 'membership') {
      return NextResponse.json(
        {
          error: 'Auto-renewal is only available for membership purchases',
          code: 'INVALID_PURCHASE_TYPE',
        },
        { status: 400 }
      );
    }

    // Toggle autoRenew and calculate nextBillingDate
    const newAutoRenewValue = !currentPurchase.autoRenew;
    let nextBillingDate: string | null = null;

    if (newAutoRenewValue) {
      // Turning auto-renew ON: set nextBillingDate to 30 days from now
      const billingDate = new Date();
      billingDate.setDate(billingDate.getDate() + 30);
      nextBillingDate = billingDate.toISOString();
    }

    // Update the purchase record
    const updatedPurchase = await db
      .update(studentPurchases)
      .set({
        autoRenew: newAutoRenewValue ? 1 : 0,
        nextBillingDate: nextBillingDate,
      })
      .where(eq(studentPurchases.id, purchaseId))
      .returning();

    if (updatedPurchase.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update purchase', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const message = newAutoRenewValue
      ? 'Auto-renewal enabled'
      : 'Auto-renewal disabled';

    return NextResponse.json(
      {
        message,
        purchase: updatedPurchase[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST toggle auto-renewal error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}