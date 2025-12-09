import { NextRequest, NextResponse } from "next/server";
import { betterAuth } from "better-auth";

export async function middleware(request: NextRequest) {
  // For protected routes, check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};