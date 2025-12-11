import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/resend";
import * as jose from "jose";

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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const users = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (!users || users.length === 0) {
      // Don't reveal if user exists or not - return success anyway
      console.log("User not found for email:", email);
      return NextResponse.json({ status: true });
    }

    const foundUser = users[0];

    if (foundUser.emailVerified) {
      console.log("User already verified:", email);
      return NextResponse.json({ status: true, message: "Already verified" });
    }

    // Create a simple verification token using jose
    const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || "fallback-secret");
    const token = await new jose.SignJWT({ 
      email: foundUser.email, 
      userId: foundUser.id 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    const baseURL = process.env.BETTER_AUTH_URL || "https://www.swiftfit215.com";
    const verificationUrl = `${baseURL}/api/auth/verify-email-custom?token=${token}`;

    const content = `
      <p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
        Hi ${foundUser.name || 'there'},
      </p>
      <p style="color: #7A736B; font-size: 15px; line-height: 1.6; text-align: center;">
        Welcome to Swift Fit Pilates! Please verify your email address to complete your registration.
      </p>
      <p style="color: #B8AFA5; font-size: 13px; text-align: center; margin-top: 20px;">
        This link will expire in 24 hours.
      </p>
    `;

    console.log("=== CUSTOM VERIFICATION EMAIL ===");
    console.log("Sending to:", foundUser.email);
    console.log("Verification URL:", verificationUrl);

    const result = await resend.emails.send({
      from: "Swift Fit Pilates <noreply@swiftfit215.com>",
      to: foundUser.email,
      subject: "Verify Your Email - Swift Fit Pilates",
      html: getEmailTemplate("Verify Your Email", content, "Verify Email", verificationUrl),
    });

    console.log("Resend result:", JSON.stringify(result, null, 2));

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
