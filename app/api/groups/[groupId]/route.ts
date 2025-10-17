import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/User"; // Keep this import for Mongoose
import { NextRequest, NextResponse } from "next/server";

// Remove all separate interface or type definitions for the params

export async function GET(
  request: NextRequest,
  // --- THIS IS THE FIX ---
  // We type the 'context' argument directly and inline.
  // We do NOT destructure { params } here.
  context: { params: { groupId: string } } 
) {
  try {
    // Destructure 'groupId' from 'context.params' inside the function
    const { groupId } = context.params; 
    
    await connectToDB();

    // This populate query is correct and will fetch the 'upiId'
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