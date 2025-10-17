import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { groupId: string }; // <-- Simpler type, no Promise needed
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { groupId } = params; // <-- 'params' is already the object
    
    await connectToDB();

    // --- 2. UPDATE THE POPULATE QUERY ---
    // Select only the fields you need from the members
    const group = await Group.findById(groupId)
      .populate("members", "name email upiId"); // <-- Specify fields here

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: any) {
    console.error("Error fetching group details:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}