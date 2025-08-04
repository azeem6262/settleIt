import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import mongoose from "mongoose";
interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams 
) {
  try {
    await connectToDB();

    const { userId } = await params;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const groups = await Group.find({ members: userObjectId }).populate("members");

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
