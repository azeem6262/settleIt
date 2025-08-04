import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { NextRequest, NextResponse } from "next/server";

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
    const group = await Group.findById(groupId).populate("members");

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group details:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}