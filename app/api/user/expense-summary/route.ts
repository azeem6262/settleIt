import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get user's MongoDB _id
    const user = await Expense.db.model("User").findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const summary = await Expense.aggregate([
      { $match: { paidBy: user._id.toString() } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

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
