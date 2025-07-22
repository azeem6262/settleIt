import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Settlement from "@/app/models/Settlement";

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    await connectToDB();
    const settlements = await Settlement.find({ groupId: params.groupId });
    return NextResponse.json(settlements);
  } catch (err) {
    return new NextResponse("Failed to fetch settlements", { status: 500 });
  }
}
