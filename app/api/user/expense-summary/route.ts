import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/models/user";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("SESSION:", session);
    console.log("SESSION USER:", session?.user);
    console.log("SESSION USER EMAIL:", session?.user?.email);
    console.log("SESSION USER ID:", session?.user?.id);

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

    // Use the user ID from session if available
    let userId = session.user.id;

    // If the user ID is not in the session, get it from the database
    if (!userId) {
      userId = user._id.toString();
      console.log("User ID not found in session, fetching from database:", userId);
    } else {
      console.log("Using userId from session:", userId);
    }

    // Check if expenses exist for this user
    const expenseCount = await Expense.countDocuments({ paidBy: userId });
    console.log("Total expenses for user:", expenseCount);

    const summary = await Expense.aggregate([
      { $match: { paidBy: userId } },
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
    console.error("Aggregation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}