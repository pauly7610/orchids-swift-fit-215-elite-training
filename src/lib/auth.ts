import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	plugins: [bearer()],
	// Automatically create user profile on signup
	user: {
		additionalFields: {},
		changeEmail: {
			enabled: false
		}
	},
	// Hook to create profile after user creation
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					try {
						// Check if profile already exists
						const existingProfile = await db.select()
							.from(userProfiles)
							.where(eq(userProfiles.userId, user.id))
							.limit(1);
						
						if (existingProfile.length === 0) {
							const now = new Date().toISOString();
							await db.insert(userProfiles).values({
								userId: user.id,
								role: 'student', // Default role for new signups
								phone: null,
								profileImage: null,
								createdAt: now,
								updatedAt: now,
							});
							console.log('User profile created for:', user.email);
						}
					} catch (error) {
						console.error('Failed to create user profile:', error);
						// Don't throw - we don't want to break the signup flow
						// Profile can be created on first login if this fails
					}
				}
			}
		}
	}
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}