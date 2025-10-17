import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/User"; // Keep this import
import { NextRequest, NextResponse } from "next/server";

// --- FIX: Define a simple type for the context object ---
type RouteContext = {
  params: {
    groupId: string;
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext // --- FIX: Use the simple, non-destructured type here ---
) {
  try {
    const { groupId } = context.params; // <-- FIX: Destructure the groupId here
    
    await connectToDB();

    const group = await Group.findById(groupId)
      .populate("members", "name email upiId"); 

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: unknown) { // Use 'unknown' for better type safety
    console.error("Error fetching group details:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}