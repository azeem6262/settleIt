import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Settlement from "@/app/models/Settlement";

export async function POST(req: Request) {
  await connectToDB();

  try {
    const { groupId, from, to, amount } = await req.json();

    if (
      !groupId ||
      !from ||
      !to ||
      typeof amount !== "number" ||
      isNaN(amount) ||
      amount <= 0
    ) {
      return new NextResponse("Invalid or missing fields", { status: 400 });
    }

    if (from === to) {
      return new NextResponse("Cannot settle with self", { status: 400 });
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    const newSettlement = new Settlement({
      groupId,
      from,
      to,
      amount: roundedAmount,
      createdAt: new Date(),
    });

    await newSettlement.save();

    return NextResponse.json({ message: "Settlement recorded" });
  } catch (error) {
    console.error("Settlement API error:", error);
    return new NextResponse("Failed to record settlement", { status: 500 });
  }
}
