import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, userProfiles } from '@/db/schema';
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
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(packages)
        .where(eq(packages.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Package not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(packages);
    const conditions = [];

    // Search by name or description
    if (search) {
      conditions.push(
        or(
          like(packages.name, `%${search}%`),
          like(packages.description, `%${search}%`)
        )
      );
    }

    // Filter by isActive
    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      conditions.push(eq(packages.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(packages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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
    const { name, description, credits, price, expirationDays, validityType, swipeSimpleLink, isActive } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (credits === undefined || credits === null) {
      return NextResponse.json({ 
        error: "Credits is required",
        code: "MISSING_CREDITS" 
      }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ 
        error: "Price is required",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }

    // Validate credits is a positive integer
    const creditsInt = parseInt(credits);
    if (isNaN(creditsInt) || creditsInt <= 0) {
      return NextResponse.json({ 
        error: "Credits must be a positive number",
        code: "INVALID_CREDITS" 
      }, { status: 400 });
    }

    // Validate price is a positive number
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      return NextResponse.json({ 
        error: "Price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Validate expirationDays if provided
    let expirationDaysInt = null;
    if (expirationDays !== undefined && expirationDays !== null) {
      expirationDaysInt = parseInt(expirationDays);
      if (isNaN(expirationDaysInt) || expirationDaysInt <= 0) {
        return NextResponse.json({ 
          error: "Expiration days must be a positive number",
          code: "INVALID_EXPIRATION_DAYS" 
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData: any = {
      name: name.trim(),
      description: description ? description.trim() : null,
      credits: creditsInt,
      price: priceFloat,
      expirationDays: expirationDaysInt,
      validityType: validityType ? validityType.trim() : null,
      swipeSimpleLink: swipeSimpleLink ? swipeSimpleLink.trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
    };

    const newPackage = await db.insert(packages)
      .values(insertData)
      .returning();

    return NextResponse.json(newPackage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, credits, price, expirationDays, validityType, swipeSimpleLink, isActive } = body;

    // Check if record exists
    const existing = await db.select()
      .from(packages)
      .where(eq(packages.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Package not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (credits !== undefined) {
      const creditsInt = parseInt(credits);
      if (isNaN(creditsInt) || creditsInt <= 0) {
        return NextResponse.json({ 
          error: "Credits must be a positive number",
          code: "INVALID_CREDITS" 
        }, { status: 400 });
      }
      updateData.credits = creditsInt;
    }

    if (price !== undefined) {
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat <= 0) {
        return NextResponse.json({ 
          error: "Price must be a positive number",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
      updateData.price = priceFloat;
    }

    if (expirationDays !== undefined) {
      if (expirationDays === null) {
        updateData.expirationDays = null;
      } else {
        const expirationDaysInt = parseInt(expirationDays);
        if (isNaN(expirationDaysInt) || expirationDaysInt <= 0) {
          return NextResponse.json({ 
            error: "Expiration days must be a positive number",
            code: "INVALID_EXPIRATION_DAYS" 
          }, { status: 400 });
        }
        updateData.expirationDays = expirationDaysInt;
      }
    }

    if (validityType !== undefined) {
      updateData.validityType = validityType ? validityType.trim() : null;
    }

    if (swipeSimpleLink !== undefined) {
      updateData.swipeSimpleLink = swipeSimpleLink ? swipeSimpleLink.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updated = await db.update(packages)
      .set(updateData)
      .where(eq(packages.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(packages)
      .where(eq(packages.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Package not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(packages)
      .where(eq(packages.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Package deleted successfully',
      package: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}