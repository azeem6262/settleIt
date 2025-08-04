// Create this file: app/api/test-session/route.ts

import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("=== SERVER SESSION DEBUG ===");
    
    // Get session
    const session = await getServerSession(authOptions);
    
    console.log("Raw session:", session);
    console.log("Session exists:", !!session);
    console.log("Session user:", session?.user);
    console.log("Session user email:", session?.user?.email);
    console.log("Session user id:", session?.user?.id);
    
    // Get all cookies for debugging
    const cookies = req.headers.get('cookie');
    console.log("Request cookies:", cookies);
    
    // Get specific NextAuth cookies
    const sessionToken = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
    console.log("Session token cookie:", sessionToken);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      cookies: {
        all: cookies,
        sessionToken: sessionToken?.value || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if(error instanceof Error){
    console.error("Session test error:", error);
    return NextResponse.json({
      error: error.message,
      hasSession: false,
    }, { status: 500 });}
  }
}