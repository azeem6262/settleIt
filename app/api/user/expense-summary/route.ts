import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/models/user";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    // ADD THIS: Better session debugging
    console.log("Getting server session...");
    const session = await getServerSession(authOptions);
    
    console.log("Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    });

    if (!session || !session.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();
    console.log("Using userId from database:", userId);

    // Check if expenses exist for this user
    const expenseCount = await Expense.countDocuments({ paidBy: userId });
    console.log("Total expenses for user:", expenseCount);

    const summary = await Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    console.log("Aggregation result:", summary);

    const formatted = summary.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(formatted);
  } catch (err) {
    // UPDATED: Better error handling with proper type checking
    console.error("API Route error:", err);
    
    // Check if it's a session-related error
    if (err instanceof Error && (err.message.includes('JWT') || err.message.includes('JWE'))) {
      console.error("Session/JWT error detected:", err.message);
      return NextResponse.json({ error: "Session error - please sign in again" }, { status: 401 });
    }
    
    // Handle string errors
    if (typeof err === 'string' && (err.includes('JWT') || err.includes('JWE'))) {
      console.error("Session/JWT string error detected:", err);
      return NextResponse.json({ error: "Session error - please sign in again" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}