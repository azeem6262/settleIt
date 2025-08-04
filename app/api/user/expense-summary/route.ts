import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { cookies, headers } from "next/headers";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
// helper to extract request/response for App Router
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Construct the request and response objects manually
    const session = await getServerSession({ req, res: null, ...authOptions });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

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
