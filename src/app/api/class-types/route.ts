import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classTypes, userProfiles } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
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

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const classType = await db
        .select()
        .from(classTypes)
        .where(eq(classTypes.id, parseInt(id)))
        .limit(1);

      if (classType.length === 0) {
        return NextResponse.json(
          { error: 'Class type not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(classType[0], { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(classTypes);

    if (search) {
      query = query.where(
        or(
          like(classTypes.name, `%${search}%`),
          like(classTypes.description, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

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
    const { name, description, durationMinutes } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate durationMinutes if provided
    if (durationMinutes !== undefined && (typeof durationMinutes !== 'number' || durationMinutes <= 0)) {
      return NextResponse.json(
        { error: 'Duration minutes must be a positive number', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      durationMinutes: durationMinutes ?? 50,
      createdAt: new Date().toISOString(),
    };

    const newClassType = await db
      .insert(classTypes)
      .values(insertData)
      .returning();

    return NextResponse.json(newClassType[0], { status: 201 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(classTypes)
      .where(eq(classTypes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Class type not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, durationMinutes } = body;

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Validate durationMinutes if provided
    if (durationMinutes !== undefined && (typeof durationMinutes !== 'number' || durationMinutes <= 0)) {
      return NextResponse.json(
        { error: 'Duration minutes must be a positive number', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string;
      description?: string | null;
      durationMinutes?: number;
    } = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }
    if (durationMinutes !== undefined) {
      updateData.durationMinutes = durationMinutes;
    }

    const updated = await db
      .update(classTypes)
      .set(updateData)
      .where(eq(classTypes.id, parseInt(id)))
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(classTypes)
      .where(eq(classTypes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Class type not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(classTypes)
      .where(eq(classTypes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Class type deleted successfully',
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