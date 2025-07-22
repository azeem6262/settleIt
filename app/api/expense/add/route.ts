// app/api/expense/add/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";

export async function POST(req: Request) {
  await connectToDB();
  const { groupId, description, amount, paidBy, splitAmong } = await req.json();
  const parsedSplitAmong = splitAmong.map((id: string) => new mongoose.Types.ObjectId(id));
  try {
    const newExpense = await Expense.create({
        groupId: new mongoose.Types.ObjectId(groupId),
        description,
        amount,
        paidBy: new mongoose.Types.ObjectId(paidBy),
        splitAmong: parsedSplitAmong,
    });
    console.log("✅ Created Expense:", newExpense);

    return NextResponse.json(newExpense);
  } catch (err) {
    return NextResponse.json({ message: "Failed to add expense", error: err }, { status: 500 });
  }
}
