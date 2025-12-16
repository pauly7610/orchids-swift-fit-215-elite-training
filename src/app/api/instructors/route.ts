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

      // Parse specialties properly
      let specialties = instructor[0].specialties;
      if (Array.isArray(specialties)) {
        // Already an array
      } else if (typeof specialties === 'string') {
        if (specialties.startsWith('[')) {
          try {
            specialties = JSON.parse(specialties);
          } catch {
            specialties = [specialties];
          }
        } else if (specialties.trim()) {
          specialties = [specialties];
        } else {
          specialties = null;
        }
      } else {
        specialties = null;
      }

      const normalized = {
        ...instructor[0],
        specialties,
      };

      return NextResponse.json(normalized, { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('isActive');

    // Build where condition
    let whereCondition = undefined;
    if (search && isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      whereCondition = and(
        like(instructors.bio, `%${search}%`),
        eq(instructors.isActive, isActiveValue),
      );
    } else if (search) {
      whereCondition = like(instructors.bio, `%${search}%`);
    } else if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      whereCondition = eq(instructors.isActive, isActiveValue);
    }

    const results = whereCondition
      ? await db.select().from(instructors).where(whereCondition).limit(limit).offset(offset)
      : await db.select().from(instructors).limit(limit).offset(offset);

    const normalizedResults = results.map((row) => {
      let specialties = row.specialties;
      
      // Handle different formats: array, JSON string, or plain string
      if (Array.isArray(specialties)) {
        // Already an array, use as-is
      } else if (typeof specialties === 'string') {
        // Try to parse as JSON if it looks like an array
        if (specialties.startsWith('[')) {
          try {
            specialties = JSON.parse(specialties);
          } catch {
            specialties = [specialties];
          }
        } else if (specialties.trim()) {
          // Plain string, wrap in array
          specialties = [specialties];
        } else {
          specialties = null;
        }
      } else {
        specialties = null;
      }
      
      return {
        ...row,
        specialties,
      };
    });

    return NextResponse.json(normalizedResults, { status: 200 });
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
    const { userProfileId, name, bio, specialties, headshotUrl, isActive } = body;

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
      name: name ? name.trim() : null,
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
    const { name, bio, specialties, headshotUrl, isActive } = body;

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

    if (name !== undefined) {
      updateData.name = name ? name.trim() : null;
    }

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