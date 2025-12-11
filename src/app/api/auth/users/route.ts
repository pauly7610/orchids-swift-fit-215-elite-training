import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify admin role
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, currentUser.id))
      .limit(1);

    if (!profile.length || profile[0].role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      }, { status: 403 });
    }

    // Fetch all users (admin only)
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      image: user.image
    }).from(user);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
