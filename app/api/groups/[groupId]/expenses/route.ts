import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    await connectToDB();
    const expenses = await Expense.find({ groupId: params.groupId })
      .populate("paidBy")
      .populate("splitAmong");

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
