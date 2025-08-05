import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export async function GET(req: NextRequest) {
  console.log("=== TEST SESSION DEBUG START ===");
  
  try {
    console.log("1. Starting session check...");
    console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
    console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
    console.log("NEXTAUTH_SECRET first 10 chars:", process.env.NEXTAUTH_SECRET?.substring(0, 10) || "none");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    
    console.log("2. Request details...");
    console.log("Request cookies:", req.cookies.getAll());
    
    console.log("3. AuthOptions check...");
    console.log("AuthOptions:", JSON.stringify({
      hasSecret: !!authOptions.secret,
      sessionStrategy: authOptions.session?.strategy,
      jwtMaxAge: authOptions.jwt?.maxAge,
      hasAdapter: !!authOptions.adapter,
      adapter: authOptions.adapter
    }));
    
    console.log("4. About to call getServerSession...");
    
    // Add timeout to prevent hanging
    const sessionPromise = getServerSession(authOptions);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout after 10 seconds')), 10000)
    );
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as Session | null;
    
    console.log("5. Session result received:");
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
        jwtMaxAge: authOptions.jwt?.maxAge,
        hasAdapter: !!authOptions.adapter
      }
    });
    
  } catch (error) {
    console.error("6. Test session error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL
      }
    }, { status: 500 });
  } finally {
    console.log("=== TEST SESSION DEBUG END ===");
  }
}