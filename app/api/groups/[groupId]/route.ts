import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    await connectToDB();
    const group = await Group.findById(params.groupId).populate("members");
    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group details:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
