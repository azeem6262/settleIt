import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Settlement from "@/app/models/Settlement";

export async function GET(
  req: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    await connectToDB();
    const { groupId } = context.params;
    const settlements = await Settlement.find({ groupId });
    return NextResponse.json(settlements);
  } catch {
    return new NextResponse("Failed to fetch settlements", { status: 500 });
  }
}
