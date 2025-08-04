import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { groupId } = await params;

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