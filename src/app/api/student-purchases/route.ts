import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases, packages, memberships } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch with package/membership details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select({
          id: studentPurchases.id,
          studentProfileId: studentPurchases.studentProfileId,
          purchaseType: studentPurchases.purchaseType,
          packageId: studentPurchases.packageId,
          membershipId: studentPurchases.membershipId,
          creditsRemaining: studentPurchases.creditsRemaining,
          creditsTotal: studentPurchases.creditsTotal,
          purchasedAt: studentPurchases.purchasedAt,
          expiresAt: studentPurchases.expiresAt,
          isActive: studentPurchases.isActive,
          paymentId: studentPurchases.paymentId,
          packageName: packages.name,
          packagePrice: packages.price,
          packageValidityType: packages.validityType,
          packageSwipeSimpleLink: packages.swipeSimpleLink,
          membershipName: memberships.name,
          membershipPriceMonthly: memberships.priceMonthly,
          membershipIsUnlimited: memberships.isUnlimited,
          membershipSwipeSimpleLink: memberships.swipeSimpleLink,
        })
        .from(studentPurchases)
        .leftJoin(packages, eq(studentPurchases.packageId, packages.id))
        .leftJoin(memberships, eq(studentPurchases.membershipId, memberships.id))
        .where(eq(studentPurchases.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Student purchase not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, filtering, and package/membership details
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentProfileId = searchParams.get('studentProfileId');
    const purchaseType = searchParams.get('purchaseType');
    const isActive = searchParams.get('isActive');

    let query = db
      .select({
        id: studentPurchases.id,
        studentProfileId: studentPurchases.studentProfileId,
        purchaseType: studentPurchases.purchaseType,
        packageId: studentPurchases.packageId,
        membershipId: studentPurchases.membershipId,
        creditsRemaining: studentPurchases.creditsRemaining,
        creditsTotal: studentPurchases.creditsTotal,
        purchasedAt: studentPurchases.purchasedAt,
        expiresAt: studentPurchases.expiresAt,
        isActive: studentPurchases.isActive,
        paymentId: studentPurchases.paymentId,
        packageName: packages.name,
        packagePrice: packages.price,
        packageValidityType: packages.validityType,
        packageSwipeSimpleLink: packages.swipeSimpleLink,
        membershipName: memberships.name,
        membershipPriceMonthly: memberships.priceMonthly,
        membershipIsUnlimited: memberships.isUnlimited,
        membershipSwipeSimpleLink: memberships.swipeSimpleLink,
      })
      .from(studentPurchases)
      .leftJoin(packages, eq(studentPurchases.packageId, packages.id))
      .leftJoin(memberships, eq(studentPurchases.membershipId, memberships.id));

    // Build filter conditions
    const conditions = [];
    if (studentProfileId) {
      conditions.push(eq(studentPurchases.studentProfileId, parseInt(studentProfileId)));
    }
    if (purchaseType) {
      conditions.push(eq(studentPurchases.purchaseType, purchaseType));
    }
    if (isActive !== null && isActive !== undefined) {
      const isActiveValue = isActive === 'true' || isActive === '1';
      conditions.push(eq(studentPurchases.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(studentPurchases.purchasedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentProfileId,
      purchaseType,
      paymentId,
      packageId,
      membershipId,
      creditsRemaining,
      creditsTotal,
      expiresAt,
      isActive,
    } = body;

    // Validate required fields
    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required', code: 'MISSING_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    if (!purchaseType) {
      return NextResponse.json(
        { error: 'purchaseType is required', code: 'MISSING_PURCHASE_TYPE' },
        { status: 400 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required', code: 'MISSING_PAYMENT_ID' },
        { status: 400 }
      );
    }

    // Validate purchaseType
    const validPurchaseTypes = ['package', 'membership', 'single_class'];
    if (!validPurchaseTypes.includes(purchaseType)) {
      return NextResponse.json(
        {
          error: `purchaseType must be one of: ${validPurchaseTypes.join(', ')}`,
          code: 'INVALID_PURCHASE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate type-specific requirements
    if (purchaseType === 'package' && !packageId) {
      return NextResponse.json(
        { error: 'packageId is required for package purchases', code: 'MISSING_PACKAGE_ID' },
        { status: 400 }
      );
    }

    if (purchaseType === 'membership' && !membershipId) {
      return NextResponse.json(
        { error: 'membershipId is required for membership purchases', code: 'MISSING_MEMBERSHIP_ID' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(parseInt(studentProfileId))) {
      return NextResponse.json(
        { error: 'studentProfileId must be a valid integer', code: 'INVALID_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(paymentId))) {
      return NextResponse.json(
        { error: 'paymentId must be a valid integer', code: 'INVALID_PAYMENT_ID' },
        { status: 400 }
      );
    }

    if (packageId !== undefined && packageId !== null && isNaN(parseInt(packageId))) {
      return NextResponse.json(
        { error: 'packageId must be a valid integer', code: 'INVALID_PACKAGE_ID' },
        { status: 400 }
      );
    }

    if (membershipId !== undefined && membershipId !== null && isNaN(parseInt(membershipId))) {
      return NextResponse.json(
        { error: 'membershipId must be a valid integer', code: 'INVALID_MEMBERSHIP_ID' },
        { status: 400 }
      );
    }

    if (creditsRemaining !== undefined && creditsRemaining !== null && isNaN(parseInt(creditsRemaining))) {
      return NextResponse.json(
        { error: 'creditsRemaining must be a valid integer', code: 'INVALID_CREDITS_REMAINING' },
        { status: 400 }
      );
    }

    if (creditsTotal !== undefined && creditsTotal !== null && isNaN(parseInt(creditsTotal))) {
      return NextResponse.json(
        { error: 'creditsTotal must be a valid integer', code: 'INVALID_CREDITS_TOTAL' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      studentProfileId: parseInt(studentProfileId),
      purchaseType,
      paymentId: parseInt(paymentId),
      purchasedAt: new Date().toISOString(),
      isActive: isActive !== undefined ? isActive : true,
    };

    if (packageId !== undefined && packageId !== null) {
      insertData.packageId = parseInt(packageId);
    }

    if (membershipId !== undefined && membershipId !== null) {
      insertData.membershipId = parseInt(membershipId);
    }

    if (creditsRemaining !== undefined && creditsRemaining !== null) {
      insertData.creditsRemaining = parseInt(creditsRemaining);
    }

    if (creditsTotal !== undefined && creditsTotal !== null) {
      insertData.creditsTotal = parseInt(creditsTotal);
    }

    if (expiresAt) {
      insertData.expiresAt = expiresAt;
    }

    // Insert record
    const newPurchase = await db
      .insert(studentPurchases)
      .values(insertData)
      .returning();

    return NextResponse.json(newPurchase[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}