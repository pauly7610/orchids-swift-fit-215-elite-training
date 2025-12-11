import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/resend";

// Email template helper
const getEmailTemplate = (title: string, content: string, buttonText: string, buttonUrl: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 40px 20px;">
	<div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
		<div style="text-align: center; margin-bottom: 30px;">
			<h1 style="color: #5A5550; font-size: 24px; margin: 0; font-weight: 400;">Swift Fit</h1>
			<p style="color: #9BA899; font-size: 12px; letter-spacing: 2px; margin: 5px 0 0 0;">PILATES AND WELLNESS STUDIO</p>
		</div>
		
		<h2 style="color: #5A5550; font-size: 20px; text-align: center; margin-bottom: 20px;">${title}</h2>
		
		${content}
		
		<div style="text-align: center; margin: 30px 0;">
			<a href="${buttonUrl}" style="display: inline-block; background-color: #9BA899; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 500; font-size: 15px;">
				${buttonText}
			</a>
		</div>
		
		<hr style="border: none; border-top: 1px solid #E8E6E3; margin: 30px 0;">
		
		<p style="color: #B8AFA5; font-size: 12px; text-align: center; margin: 0;">
			Swift Fit Pilates & Wellness Studio<br>
			2245 E Tioga Street, Philadelphia, PA 19134
		</p>
	</div>
</body>
</html>
`;

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true,
		requireEmailVerification: true,
		// Password reset email
		sendResetPassword: async ({ user, url }) => {
			console.log('=== PASSWORD RESET EMAIL ===');
			console.log('Sending to:', user.email);
			try {
				const content = `
					<p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
						Hi ${user.name || 'there'},
					</p>
					<p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
						We received a request to reset your password. Click the button below to create a new password.
					</p>
					<p style="color: #B8AFA5; font-size: 13px; text-align: center; margin-top: 20px;">
						This link will expire in 1 hour for security reasons.
					</p>
					<p style="color: #B8AFA5; font-size: 13px; text-align: center;">
						If you didn't request this, you can safely ignore this email.
					</p>
				`;
				
				const result = await resend.emails.send({
					from: "Swift Fit Pilates <noreply@swiftfit215.com>",
					to: user.email,
					subject: "Reset Your Password - Swift Fit Pilates",
					html: getEmailTemplate("Reset Your Password", content, "Reset Password", url),
				});
				console.log('Password reset email result:', result);
			} catch (error) {
				console.error('Failed to send password reset email:', error);
				throw error;
			}
		},
	},
	// Email verification configuration - MUST be separate from emailAndPassword
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			console.log('=== VERIFICATION EMAIL ATTEMPT ===');
			console.log('User email:', user.email);
			console.log('User name:', user.name);
			console.log('Verification URL:', url);
			
			try {
				const content = `
					<p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
						Hi ${user.name || 'there'},
					</p>
					<p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
						Welcome to Swift Fit Pilates! Please verify your email address to complete your registration.
					</p>
					<p style="color: #B8AFA5; font-size: 13px; text-align: center; margin-top: 20px;">
						This link will expire in 24 hours.
					</p>
				`;
				
				console.log('Sending email via Resend...');
				const result = await resend.emails.send({
					from: "Swift Fit Pilates <noreply@swiftfit215.com>",
					to: user.email,
					subject: "Verify Your Email - Swift Fit Pilates",
					html: getEmailTemplate("Verify Your Email", content, "Verify Email", url),
				});
				
				console.log('Resend result:', JSON.stringify(result, null, 2));
				
				if (result.error) {
					console.error('Resend error:', result.error);
				} else {
					console.log('Verification email sent successfully to:', user.email);
				}
			} catch (error) {
				console.error('Failed to send verification email:', error);
			}
		},
	},
	plugins: [bearer()],
	user: {
		additionalFields: {},
		changeEmail: {
			enabled: true
		}
	},
	// Hook to create profile after user creation
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					try {
						const existingProfile = await db.select()
							.from(userProfiles)
							.where(eq(userProfiles.userId, user.id))
							.limit(1);
						
						if (existingProfile.length === 0) {
							const now = new Date().toISOString();
							await db.insert(userProfiles).values({
								userId: user.id,
								role: 'student',
								phone: null,
								profileImage: null,
								emailReminders: true,
								reminderHoursBefore: 24,
								marketingEmails: true,
								createdAt: now,
								updatedAt: now,
							});
							console.log('User profile created for:', user.email);
						}
					} catch (error) {
						console.error('Failed to create user profile:', error);
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
