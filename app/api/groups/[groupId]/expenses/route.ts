import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { groupId: string } }
) {
  const { params } = context;
  await connectToDB();

  const expenses = await Expense.find({ groupId: params.groupId })
    .populate("paidBy")
    .populate("splitAmong");

  return NextResponse.json(expenses);
}

