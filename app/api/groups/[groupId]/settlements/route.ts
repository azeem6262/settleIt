import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Settlement from "@/app/models/Settlement";

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
    const settlements = await Settlement.find({ groupId });
    return NextResponse.json(settlements);
  } catch {
    return new NextResponse("Failed to fetch settlements", { status: 500 });
  }
}