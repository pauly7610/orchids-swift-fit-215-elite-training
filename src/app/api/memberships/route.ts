import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { memberships, userProfiles } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  if (!user) return false;
  
  const profile = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);
  
  return profile.length > 0 && profile[0].role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const membership = await db
        .select()
        .from(memberships)
        .where(eq(memberships.id, parseInt(id)))
        .limit(1);

      if (membership.length === 0) {
        return NextResponse.json(
          { error: 'Membership not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(membership[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('isActive');
    const isUnlimitedParam = searchParams.get('isUnlimited');

    let query = db.select().from(memberships);

    // Build filter conditions
    const conditions = [];

    // Search condition
    if (search) {
      conditions.push(
        or(
          like(memberships.name, `%${search}%`),
          like(memberships.description, `%${search}%`)
        )
      );
    }

    // Filter by isActive
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      conditions.push(eq(memberships.isActive, isActive));
    }

    // Filter by isUnlimited
    if (isUnlimitedParam !== null) {
      const isUnlimited = isUnlimitedParam === 'true';
      conditions.push(eq(memberships.isUnlimited, isUnlimited));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination
    const results = await query
      .orderBy(desc(memberships.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, priceMonthly, isUnlimited, creditsPerMonth, swipeSimpleLink, isActive } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (priceMonthly === undefined || priceMonthly === null) {
      return NextResponse.json(
        { error: 'Price monthly is required', code: 'MISSING_PRICE_MONTHLY' },
        { status: 400 }
      );
    }

    // Validate priceMonthly is a positive number
    const price = parseFloat(priceMonthly);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Price monthly must be a positive number', code: 'INVALID_PRICE_MONTHLY' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      priceMonthly: price,
      isUnlimited: isUnlimited !== undefined ? Boolean(isUnlimited) : true,
      creditsPerMonth: creditsPerMonth !== undefined && creditsPerMonth !== null 
        ? parseInt(creditsPerMonth) 
        : null,
      swipeSimpleLink: swipeSimpleLink ? swipeSimpleLink.trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
    };

    // Validate creditsPerMonth if provided
    if (insertData.creditsPerMonth !== null && isNaN(insertData.creditsPerMonth)) {
      return NextResponse.json(
        { error: 'Credits per month must be a valid number', code: 'INVALID_CREDITS_PER_MONTH' },
        { status: 400 }
      );
    }

    const newMembership = await db
      .insert(memberships)
      .values(insertData)
      .returning();

    return NextResponse.json(newMembership[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if membership exists
    const existing = await db
      .select()
      .from(memberships)
      .where(eq(memberships.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Membership not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, priceMonthly, isUnlimited, creditsPerMonth, swipeSimpleLink, isActive } = body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (priceMonthly !== undefined) {
      const price = parseFloat(priceMonthly);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Price monthly must be a positive number', code: 'INVALID_PRICE_MONTHLY' },
          { status: 400 }
        );
      }
      updateData.priceMonthly = price;
    }

    if (isUnlimited !== undefined) {
      updateData.isUnlimited = Boolean(isUnlimited);
    }

    if (creditsPerMonth !== undefined) {
      if (creditsPerMonth === null) {
        updateData.creditsPerMonth = null;
      } else {
        const credits = parseInt(creditsPerMonth);
        if (isNaN(credits)) {
          return NextResponse.json(
            { error: 'Credits per month must be a valid number', code: 'INVALID_CREDITS_PER_MONTH' },
            { status: 400 }
          );
        }
        updateData.creditsPerMonth = credits;
      }
    }

    if (swipeSimpleLink !== undefined) {
      updateData.swipeSimpleLink = swipeSimpleLink ? swipeSimpleLink.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(memberships)
      .set(updateData)
      .where(eq(memberships.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if membership exists
    const existing = await db
      .select()
      .from(memberships)
      .where(eq(memberships.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Membership not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(memberships)
      .where(eq(memberships.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Membership deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}