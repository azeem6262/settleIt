import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("=== TEST SESSION DEBUG ===");
    console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
    console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
    console.log("NEXTAUTH_SECRET first 10 chars:", process.env.NEXTAUTH_SECRET?.substring(0, 10) || "none");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    console.log("Request cookies:", req.cookies.getAll());
    console.log("AuthOptions:", JSON.stringify({
      hasSecret: !!authOptions.secret,
      sessionStrategy: authOptions.session?.strategy,
      jwtMaxAge: authOptions.jwt?.maxAge
    }));
    
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
      environment: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL
      },
      authOptions: {
        hasSecret: !!authOptions.secret,
        sessionStrategy: authOptions.session?.strategy,
        jwtMaxAge: authOptions.jwt?.maxAge
      }
    });
    
  } catch (error) {
    console.error("Test session error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}