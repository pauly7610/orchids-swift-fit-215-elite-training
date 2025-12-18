import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases, packages, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Helper function to check if current user is admin
async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return false;
    }
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 && profile[0].role === 'admin';
  } catch {
    return false;
  }
}

// POST: Admin adds credits to a student's account
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentProfileId, packageId, credits, expirationDays, notes } = body;

    // Validate required fields
    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required', code: 'MISSING_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Verify student profile exists
    const studentProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.id, parseInt(studentProfileId)))
      .limit(1);

    if (studentProfile.length === 0) {
      return NextResponse.json(
        { error: 'Student profile not found', code: 'STUDENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    let creditsToAdd: number;
    let expiresAt: string | null = null;
    let purchasePackageId: number | null = null;

    // If packageId is provided, get package details
    if (packageId) {
      const packageData = await db.select()
        .from(packages)
        .where(eq(packages.id, parseInt(packageId)))
        .limit(1);

      if (packageData.length === 0) {
        return NextResponse.json(
          { error: 'Package not found', code: 'PACKAGE_NOT_FOUND' },
          { status: 404 }
        );
      }

      const pkg = packageData[0];
      creditsToAdd = pkg.credits;
      purchasePackageId = pkg.id;

      if (pkg.expirationDays) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + pkg.expirationDays);
        expiresAt = expDate.toISOString();
      }
    } else {
      // Manual credit addition
      if (!credits || credits <= 0) {
        return NextResponse.json(
          { error: 'Either packageId or a positive credits amount is required', code: 'INVALID_CREDITS' },
          { status: 400 }
        );
      }
      creditsToAdd = parseInt(credits);

      // Calculate expiration if provided
      if (expirationDays && expirationDays > 0) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + parseInt(expirationDays));
        expiresAt = expDate.toISOString();
      }
    }

    // Create a dummy payment record for admin-added credits
    // Using paymentId = 0 to indicate admin-added (or we could create a special payment record)
    const { payments } = await import('@/db/schema');
    
    const adminPayment = await db.insert(payments).values({
      studentProfileId: parseInt(studentProfileId),
      amount: 0,
      currency: 'USD',
      paymentMethod: 'admin',
      squarePaymentId: `ADMIN-${Date.now()}`,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).returning();

    // Create the student purchase record
    const newPurchase = await db.insert(studentPurchases).values({
      studentProfileId: parseInt(studentProfileId),
      purchaseType: purchasePackageId ? 'package' : 'single_class',
      packageId: purchasePackageId,
      membershipId: null,
      creditsRemaining: creditsToAdd,
      creditsTotal: creditsToAdd,
      purchasedAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      paymentId: adminPayment[0].id,
      autoRenew: false,
    }).returning();

    console.log(`Admin added ${creditsToAdd} credits to student profile ${studentProfileId}${notes ? ` - Notes: ${notes}` : ''}`);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${creditsToAdd} credits to student account`,
      purchase: newPurchase[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Admin add credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET: List all packages for admin reference
export async function GET() {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    const allPackages = await db.select().from(packages);
    
    return NextResponse.json({
      packages: allPackages,
    });
  } catch (error) {
    console.error('Admin get packages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
