import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases } from '@/db/schema';
import { eq, and, or, gt, isNull } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentProfileId = params.id;

    // Validate ID parameter
    if (!studentProfileId || isNaN(parseInt(studentProfileId))) {
      return NextResponse.json(
        { 
          error: 'Valid student profile ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(studentProfileId);
    const currentDate = new Date().toISOString();

    // Query active purchases for the student
    // Active means: isActive = true AND (expiresAt is null OR expiresAt > current date)
    const activePurchases = await db
      .select()
      .from(studentPurchases)
      .where(
        and(
          eq(studentPurchases.studentProfileId, id),
          eq(studentPurchases.isActive, true),
          or(
            isNull(studentPurchases.expiresAt),
            gt(studentPurchases.expiresAt, currentDate)
          )
        )
      );

    // If no active purchases found
    if (activePurchases.length === 0) {
      return NextResponse.json(
        { 
          error: 'No active credits or memberships found for this student',
          code: 'NO_ACTIVE_PURCHASES'
        },
        { status: 404 }
      );
    }

    // Separate packages and memberships
    const packages = activePurchases.filter(
      purchase => purchase.purchaseType === 'package'
    );

    const memberships = activePurchases.filter(
      purchase => purchase.purchaseType === 'membership'
    );

    // Calculate total credits from packages
    const totalCredits = packages.reduce(
      (sum, purchase) => sum + (purchase.creditsRemaining || 0),
      0
    );

    // Check if any unlimited membership exists
    const hasUnlimitedAccess = memberships.some(
      membership => membership.creditsRemaining === null || membership.creditsRemaining === -1
    );

    // Return response object
    return NextResponse.json({
      packages: packages.map(pkg => ({
        id: pkg.id,
        packageId: pkg.packageId,
        creditsRemaining: pkg.creditsRemaining,
        creditsTotal: pkg.creditsTotal,
        purchasedAt: pkg.purchasedAt,
        expiresAt: pkg.expiresAt,
        paymentId: pkg.paymentId
      })),
      memberships: memberships.map(membership => ({
        id: membership.id,
        membershipId: membership.membershipId,
        creditsRemaining: membership.creditsRemaining,
        creditsTotal: membership.creditsTotal,
        purchasedAt: membership.purchasedAt,
        expiresAt: membership.expiresAt,
        paymentId: membership.paymentId
      })),
      totalCredits,
      hasUnlimitedAccess
    });

  } catch (error) {
    console.error('GET student credits error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}