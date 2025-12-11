import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as jose from "jose";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const baseURL = process.env.BETTER_AUTH_URL || "https://www.swiftfit215.com";

    if (!token) {
      return NextResponse.redirect(new URL("/verify-email?error=missing-token", baseURL));
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || "fallback-secret");
    
    try {
      const { payload } = await jose.jwtVerify(token, secret);
      const email = payload.email as string;
      const userId = payload.userId as string;

      if (!email || !userId) {
        return NextResponse.redirect(new URL("/verify-email?error=invalid-token", baseURL));
      }

      // Update the user's email_verified status using Drizzle
      await db.update(user)
        .set({ 
          emailVerified: true,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));

      console.log("=== EMAIL VERIFIED ===");
      console.log("User ID:", userId);
      console.log("Email:", email);

      // Redirect to login with success
      return NextResponse.redirect(new URL("/login?verified=true", baseURL));
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.redirect(new URL("/verify-email?error=expired", baseURL));
    }
  } catch (error) {
    console.error("Verify email error:", error);
    const baseURL = process.env.BETTER_AUTH_URL || "https://www.swiftfit215.com";
    return NextResponse.redirect(new URL("/verify-email?error=server", baseURL));
  }
}
