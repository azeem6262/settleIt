import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, userId } = await req.json();

  if (!code || !userId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    await connectToDB();

    const group = await Group.findOne({ code });

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    if (group.members.includes(userId)) {
      return NextResponse.json({ message: "Already a member" }, { status: 409 });
    }

    group.members.push(userId);
    await group.save();

    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error("Join Group Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
