import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles, user as userTable } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to extract first name from full name or email
function extractDisplayName(name: string | null, email: string): string {
  if (name && name.trim()) {
    // Return first name (first word before space)
    const firstName = name.trim().split(/\s+/)[0];
    return firstName;
  }
  // Fall back to email prefix (before @)
  return email.split('@')[0];
}

const VALID_ROLES = ['admin', 'instructor', 'student'] as const;

// Helper function to get current user's profile and role
async function getCurrentUserProfile(userId: string) {
  const profile = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return profile.length > 0 ? profile[0] : null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userIdFilter = searchParams.get('userId');

    // If no filters provided and not explicitly requesting a list, return the current user's profile
    if (!id && !userIdFilter && !searchParams.get('role') && !searchParams.get('search') && !searchParams.get('limit')) {
      const profile = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);

      if (profile.length === 0) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      return NextResponse.json(profile[0], { status: 200 });
    }

    // For accessing other users' profiles or listing, check if user is admin
    const currentUserProfile = await getCurrentUserProfile(user.id);
    const isAdmin = currentUserProfile?.role === 'admin';

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

      // Non-admins can only access their own profile
      if (!isAdmin && profile[0].userId !== user.id) {
        return NextResponse.json({ 
          error: 'Access denied',
          code: 'FORBIDDEN' 
        }, { status: 403 });
      }

      return NextResponse.json(profile[0], { status: 200 });
    }

    // List with pagination, search, and filtering (admin only for listing all)
    if (!isAdmin) {
      // Non-admin users can only filter by their own userId
      if (userIdFilter && userIdFilter !== user.id) {
        return NextResponse.json({ 
          error: 'Access denied',
          code: 'FORBIDDEN' 
        }, { status: 403 });
      }
    }

    const limitNum = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offsetNum = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    // Build conditions array
    const conditions: any[] = [];

    // Search functionality - search in user name and email too
    if (search) {
      conditions.push(
        or(
          like(userProfiles.role, `%${search}%`),
          like(userProfiles.phone, `%${search}%`),
          like(userTable.name, `%${search}%`),
          like(userTable.email, `%${search}%`)
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

    // Join with user table to get name and email
    const baseQuery = db.select({
      id: userProfiles.id,
      userId: userProfiles.userId,
      role: userProfiles.role,
      phone: userProfiles.phone,
      profileImage: userProfiles.profileImage,
      emailReminders: userProfiles.emailReminders,
      reminderHoursBefore: userProfiles.reminderHoursBefore,
      marketingEmails: userProfiles.marketingEmails,
      createdAt: userProfiles.createdAt,
      updatedAt: userProfiles.updatedAt,
      userName: userTable.name,
      userEmail: userTable.email,
    })
    .from(userProfiles)
    .leftJoin(userTable, eq(userProfiles.userId, userTable.id));

    const results = conditions.length > 0
      ? await baseQuery.where(and(...conditions)).orderBy(desc(userProfiles.createdAt)).limit(limitNum).offset(offsetNum)
      : await baseQuery.orderBy(desc(userProfiles.createdAt)).limit(limitNum).offset(offsetNum);

    // Add displayName to each result
    const resultsWithDisplayName = results.map(profile => ({
      ...profile,
      displayName: extractDisplayName(profile.userName, profile.userEmail || ''),
    }));

    return NextResponse.json(resultsWithDisplayName, { status: 200 });
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

    // Get current user's profile to check role
    const currentUserProfile = await getCurrentUserProfile(user.id);
    const isAdmin = currentUserProfile?.role === 'admin';

    let profileId: number;
    let targetProfile: typeof userProfiles.$inferSelect | null = null;

    // If no id provided, update current user's profile
    if (!id) {
      if (!currentUserProfile) {
        return NextResponse.json({ 
          error: 'User profile not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }
      profileId = currentUserProfile.id;
      targetProfile = currentUserProfile;
    } else {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      profileId = parseInt(id);

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
      targetProfile = existing[0];
    }

    // Determine if user is updating their own profile or someone else's
    const isOwnProfile = targetProfile?.userId === user.id;

    // Non-admins can only update their own profile
    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ 
        error: 'Access denied. You can only update your own profile.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Role changes are ADMIN ONLY
    if ('role' in body) {
      if (!isAdmin) {
        return NextResponse.json({ 
          error: "Only administrators can change user roles",
          code: "ADMIN_REQUIRED" 
        }, { status: 403 });
      }

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

    // Only admins can delete profiles
    const currentUserProfile = await getCurrentUserProfile(user.id);
    if (!currentUserProfile || currentUserProfile.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED' 
      }, { status: 403 });
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

    // Prevent deleting own admin profile
    if (existing[0].userId === user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own profile',
        code: 'SELF_DELETE_FORBIDDEN' 
      }, { status: 400 });
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
