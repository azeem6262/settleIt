import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    console.log("Getting server session...");
    const session = await getServerSession(authOptions);
    
    console.log("Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      hasId: !!session?.user?.id,
      email: session?.user?.email,
      id: session?.user?.id
    });

    if (!session || !session.user?.email || !session.user?.id) {
      console.log("No session, email, or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB for Expense queries
    await connectToDB();
    
    // IMPORTANT: With database strategy, session.user.id is the MongoDB ObjectId
    // You don't need to query the User collection again!
    const userId = session.user.id;
    console.log("Using userId from session:", userId);

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid ObjectId format:", userId);
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    // Check if expenses exist for this user
    const expenseCount = await Expense.countDocuments({ 
      paidBy: new mongoose.Types.ObjectId(userId) 
    });
    console.log("Total expenses for user:", expenseCount);

    // Aggregate expenses by type
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
    console.error("API Route error:", err);
    
    // Handle different types of errors
    if (err instanceof Error) {
      // Database connection errors
      if (err.message.includes('MongooseError') || err.message.includes('MongoDB')) {
        console.error("Database error:", err.message);
        return NextResponse.json({ error: "Database connection error" }, { status: 503 });
      }
      
      // Session/Auth errors  
      if (err.message.includes('JWT') || err.message.includes('JWE') || err.message.includes('session')) {
        console.error("Session error:", err.message);
        return NextResponse.json({ error: "Session error - please sign in again" }, { status: 401 });
      }
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}