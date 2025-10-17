import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ groupId: string }> }
) {
  try {
    // Await the params Promise in Next.js 15
    const params = await props.params;
    const { groupId } = params;
    
    await connectToDB();

    const group = await Group.findById(groupId)
      .populate("members", "name email upiId");

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: unknown) {
    console.error("Error fetching group details:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}