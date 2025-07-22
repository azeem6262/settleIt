import { NextResponse } from "next/server";
import { User } from "@/app/models/user";
import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: { userId: string } }
) {
  try {
    await connectToDB();

    const userId = context.params.userId;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const groups = await Group.find({ members: userObjectId }).populate("members");

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
