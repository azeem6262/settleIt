// Create this file: /app/api/test-session/route.ts

import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("=== TEST SESSION DEBUG ===");
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    console.log("Request cookies:", req.cookies.getAll());
    
    const session = await getServerSession(authOptions);
    
    console.log("Session result:", {
      hasSession: !!session,
      session: session,
      user: session?.user,
      expires: session?.expires
    });

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session,
      cookies: req.cookies.getAll(),
      headers: Object.fromEntries(req.headers.entries())
    });
    
  } catch (error) {
    console.error("Test session error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}