import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pendingPurchases, packages, memberships, userProfiles, user, payments, studentPurchases } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Helper to get current user's profile
async function getCurrentUserProfile() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    return profile.length > 0 ? profile[0] : null;
  } catch {
    return null;
  }
}

// GET: List pending purchases (admin only)
export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const results = await db
      .select({
        id: pendingPurchases.id,
        studentProfileId: pendingPurchases.studentProfileId,
        packageId: pendingPurchases.packageId,
        membershipId: pendingPurchases.membershipId,
        productName: pendingPurchases.productName,
        productType: pendingPurchases.productType,
        amount: pendingPurchases.amount,
        status: pendingPurchases.status,
        createdAt: pendingPurchases.createdAt,
        confirmedAt: pendingPurchases.confirmedAt,
        notes: pendingPurchases.notes,
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(pendingPurchases)
      .leftJoin(userProfiles, eq(pendingPurchases.studentProfileId, userProfiles.id))
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(pendingPurchases.status, status))
      .orderBy(desc(pendingPurchases.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET pending purchases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a pending purchase (when user clicks buy)
export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, membershipId, productName, productType, amount } = body;

    if (!productName || !productType || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create pending purchase record
    const newPending = await db.insert(pendingPurchases).values({
      studentProfileId: profile.id,
      packageId: packageId || null,
      membershipId: membershipId || null,
      productName,
      productType,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Purchase intent recorded',
      pending: newPending[0],
    }, { status: 201 });
  } catch (error) {
    console.error('POST pending purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Confirm a pending purchase (admin only) - adds credits to user
export async function PUT(request: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { pendingId, action } = body; // action: 'confirm' or 'cancel'

    if (!pendingId) {
      return NextResponse.json({ error: 'pendingId is required' }, { status: 400 });
    }

    // Get the pending purchase
    const pending = await db.select()
      .from(pendingPurchases)
      .where(eq(pendingPurchases.id, parseInt(pendingId)))
      .limit(1);

    if (pending.length === 0) {
      return NextResponse.json({ error: 'Pending purchase not found' }, { status: 404 });
    }

    const pendingPurchase = pending[0];

    if (pendingPurchase.status !== 'pending') {
      return NextResponse.json({ error: 'Purchase already processed' }, { status: 400 });
    }

    if (action === 'cancel') {
      await db.update(pendingPurchases)
        .set({ status: 'cancelled', confirmedAt: new Date().toISOString(), confirmedBy: profile.id })
        .where(eq(pendingPurchases.id, parseInt(pendingId)));

      return NextResponse.json({ success: true, message: 'Purchase cancelled' });
    }

    // Confirm the purchase - add credits
    let creditsToAdd = 0;
    let expiresAt: string | null = null;

    if (pendingPurchase.productType === 'package' && pendingPurchase.packageId) {
      const pkg = await db.select().from(packages)
        .where(eq(packages.id, pendingPurchase.packageId))
        .limit(1);

      if (pkg.length > 0) {
        creditsToAdd = pkg[0].credits;
        if (pkg[0].expirationDays) {
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + pkg[0].expirationDays);
          expiresAt = expDate.toISOString();
        }
      }
    } else if (pendingPurchase.productType === 'membership' && pendingPurchase.membershipId) {
      const membership = await db.select().from(memberships)
        .where(eq(memberships.id, pendingPurchase.membershipId))
        .limit(1);

      if (membership.length > 0) {
        creditsToAdd = membership[0].creditsPerMonth || 0; // null for unlimited
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 30);
        expiresAt = expDate.toISOString();
      }
    }

    // Create payment record
    const paymentRecord = await db.insert(payments).values({
      studentProfileId: pendingPurchase.studentProfileId,
      amount: pendingPurchase.amount,
      currency: 'USD',
      paymentMethod: 'swipesimple',
      squarePaymentId: `SWIPE-${Date.now()}`,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).returning();

    // Create student purchase
    const isUnlimitedMembership = pendingPurchase.productType === 'membership' && creditsToAdd === 0;
    
    await db.insert(studentPurchases).values({
      studentProfileId: pendingPurchase.studentProfileId,
      purchaseType: pendingPurchase.productType,
      packageId: pendingPurchase.packageId,
      membershipId: pendingPurchase.membershipId,
      creditsRemaining: isUnlimitedMembership ? null : creditsToAdd,
      creditsTotal: isUnlimitedMembership ? null : creditsToAdd,
      purchasedAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      paymentId: paymentRecord[0].id,
      autoRenew: pendingPurchase.productType === 'membership',
    });

    // Mark pending as confirmed
    await db.update(pendingPurchases)
      .set({ 
        status: 'confirmed', 
        confirmedAt: new Date().toISOString(), 
        confirmedBy: profile.id 
      })
      .where(eq(pendingPurchases.id, parseInt(pendingId)));

    // Get student info for response
    const studentInfo = await db.select({ name: user.name, email: user.email })
      .from(userProfiles)
      .leftJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(userProfiles.id, pendingPurchase.studentProfileId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: `Added ${isUnlimitedMembership ? 'unlimited access' : `${creditsToAdd} credits`} to ${studentInfo[0]?.name || 'user'}`,
      credits: isUnlimitedMembership ? 'unlimited' : creditsToAdd,
    });
  } catch (error) {
    console.error('PUT pending purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
