import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import Expense from "@/app/models/Expense";
import { connectToDB } from "@/app/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Now you can directly use session.user.id (which is the MongoDB _id)
    const userId = session.user.id;

    const summary = await Expense.aggregate([
      { $match: { paidBy: userId } }, // Use the ID directly from session
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