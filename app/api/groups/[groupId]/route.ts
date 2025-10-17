import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/User"; // Keep this import
import { NextRequest, NextResponse } from "next/server";

// Remove the separate RouteParams interface

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } } // <-- FIX: Type the argument inline
) {
  try {
    const { groupId } = params; // <-- FIX: No 'await' needed
    
    await connectToDB();
    const group = await Group.findById(groupId).populate("members", "name email upiId");

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: unknown) {
    console.error("Error fetching group details:", error);
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}