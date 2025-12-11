import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_ROLES = ['admin', 'instructor', 'student'] as const;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userIdFilter = searchParams.get('userId');

    // If no filters provided, return the current user's profile
    if (!id && !userIdFilter && !searchParams.get('role') && !searchParams.get('search')) {
      const profile = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);

      if (profile.length === 0) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      return NextResponse.json(profile[0], { status: 200 });
    }

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const profile = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.id, parseInt(id)))
        .limit(1);

      if (profile.length === 0) {
        return NextResponse.json({ 
          error: 'User profile not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(profile[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    let query = db.select().from(userProfiles);
    const conditions = [];

    // Search functionality
    if (search) {
      conditions.push(
        or(
          like(userProfiles.role, `%${search}%`),
          like(userProfiles.phone, `%${search}%`)
        )
      );
    }

    // Role filter
    if (roleFilter) {
      if (!VALID_ROLES.includes(roleFilter as any)) {
        return NextResponse.json({ 
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE' 
        }, { status: 400 });
      }
      conditions.push(eq(userProfiles.role, roleFilter));
    }

    // UserId filter
    if (userIdFilter) {
      conditions.push(eq(userProfiles.userId, userIdFilter));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(userProfiles.createdAt))
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, phone, profileImage, emailReminders, reminderHoursBefore, marketingEmails } = body;

    // Security check: reject if any user identifier fields are in the body
    if ('userId' in body && body.userId !== userId) {
      return NextResponse.json({ 
        error: "User ID cannot be modified",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ 
        error: "userId is required and must be a non-empty string",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!role || typeof role !== 'string') {
      return NextResponse.json({ 
        error: "role is required and must be a string",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    // Validate role
    if (!VALID_ROLES.includes(role as any)) {
      return NextResponse.json({ 
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Check if profile already exists for this userId
    const existing = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: "User profile already exists for this user ID",
        code: "DUPLICATE_USER_PROFILE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      userId: userId.trim(),
      role: role.trim(),
      phone: phone ? phone.trim() : null,
      profileImage: profileImage ? profileImage.trim() : null,
      emailReminders: emailReminders ?? true,
      reminderHoursBefore: reminderHoursBefore ?? 24,
      marketingEmails: marketingEmails ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const newProfile = await db.insert(userProfiles)
      .values(insertData)
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();

    // Security check: reject if userId is in the body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be modified",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    let profileId: number;

    // If no id provided, update current user's profile
    if (!id) {
      const userProfile = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);

      if (userProfile.length === 0) {
        return NextResponse.json({ 
          error: 'User profile not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      profileId = userProfile[0].id;
    } else {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      profileId = parseInt(id);
    }

    // Check if record exists
    const existing = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.id, profileId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'User profile not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add role if provided
    if ('role' in body) {
      if (!body.role || typeof body.role !== 'string') {
        return NextResponse.json({ 
          error: "role must be a non-empty string",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }

      if (!VALID_ROLES.includes(body.role as any)) {
        return NextResponse.json({ 
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }

      updates.role = body.role.trim();
    }

    // Add phone if provided
    if ('phone' in body) {
      updates.phone = body.phone ? body.phone.trim() : null;
    }

    // Add profileImage if provided
    if ('profileImage' in body) {
      updates.profileImage = body.profileImage ? body.profileImage.trim() : null;
    }

    // Add notification preferences if provided
    if ('emailReminders' in body) {
      updates.emailReminders = Boolean(body.emailReminders);
    }

    if ('reminderHoursBefore' in body) {
      const hours = parseInt(body.reminderHoursBefore);
      if (!isNaN(hours) && hours >= 1 && hours <= 48) {
        updates.reminderHoursBefore = hours;
      }
    }

    if ('marketingEmails' in body) {
      updates.marketingEmails = Boolean(body.marketingEmails);
    }

    const updated = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, profileId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update user profile',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'User profile not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(userProfiles)
      .where(eq(userProfiles.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete user profile',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User profile deleted successfully',
      deletedProfile: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
