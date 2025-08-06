import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 🔐 Authenticate user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 🧪 Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    await connectToDB();

    // 📊 Aggregate expense summary by type
    const summary = await Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // 🧾 Format data
    const formatted = summary.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(formatted, { status: 200 });

  } catch (err) {
    console.error("Expense Summary Error:", err);

    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("jwt") || err.message.toLowerCase().includes("session")) {
        return NextResponse.json({ error: "Session error - please sign in again" }, { status: 401 });
      }

      if (err.message.toLowerCase().includes("mongo")) {
        return NextResponse.json({ error: "Database error" }, { status: 503 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
