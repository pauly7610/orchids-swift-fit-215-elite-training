import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { instructors, userProfiles } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const instructor = await db
        .select()
        .from(instructors)
        .where(eq(instructors.id, parseInt(id)))
        .limit(1);

      if (instructor.length === 0) {
        return NextResponse.json(
          { error: 'Instructor not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(instructor[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(instructors);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(like(instructors.bio, `%${search}%`));
    }

    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      conditions.push(eq(instructors.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
    const { userProfileId, bio, specialties, headshotUrl, isActive } = body;

    // Validate required fields
    if (!userProfileId) {
      return NextResponse.json(
        { error: 'userProfileId is required', code: 'MISSING_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(userProfileId))) {
      return NextResponse.json(
        { error: 'userProfileId must be a valid integer', code: 'INVALID_USER_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate specialties if provided
    if (specialties !== undefined && specialties !== null) {
      if (!Array.isArray(specialties)) {
        return NextResponse.json(
          { error: 'specialties must be an array', code: 'INVALID_SPECIALTIES_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data with defaults
    const insertData: any = {
      userProfileId: parseInt(userProfileId),
      bio: bio ? bio.trim() : null,
      specialties: specialties || null,
      headshotUrl: headshotUrl ? headshotUrl.trim() : null,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
    };

    const newInstructor = await db
      .insert(instructors)
      .values(insertData)
      .returning();

    return NextResponse.json(newInstructor[0], { status: 201 });
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const existing = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Instructor not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { bio, specialties, headshotUrl, isActive } = body;

    // Validate specialties if provided
    if (specialties !== undefined && specialties !== null) {
      if (!Array.isArray(specialties)) {
        return NextResponse.json(
          { error: 'specialties must be an array', code: 'INVALID_SPECIALTIES_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (specialties !== undefined) {
      updateData.specialties = specialties;
    }

    if (headshotUrl !== undefined) {
      updateData.headshotUrl = headshotUrl ? headshotUrl.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    const updated = await db
      .update(instructors)
      .set(updateData)
      .where(eq(instructors.id, parseInt(id)))
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const existing = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Instructor not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(instructors)
      .where(eq(instructors.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Instructor deleted successfully',
        instructor: deleted[0],
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