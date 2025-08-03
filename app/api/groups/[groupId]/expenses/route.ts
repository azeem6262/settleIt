import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;

    await connectToDB();

    const expenses = await Expense.find({ groupId })
      .populate("paidBy")
      .populate("splitAmong");

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
