/*import { connectToDB } from "@/app/lib/mongoose";
import { Group } from "@/app/models/groups";
import { User } from "@/app/models/user";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { name, userId } = await req.json();

  if (!name || !userId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    await connectToDB();

    const code = nanoid(6).toUpperCase(); // generates unique group code

    const group = await Group.create({
      name,
      code,
      members: [userId],
      createdBy: userId,
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Create Group Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
*/
import { NextResponse } from "next/server";
import { Group } from "@/app/models/groups";
import { connectToDB } from "@/app/lib/mongoose";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json(); 
    const { name, userId } = body;

    if (!name || !userId) {
      return NextResponse.json({ message: "Missing name or userId" }, { status: 400 });
    }

    const code = Math.random().toString(36).substring(2, 8);

    const newGroup = await Group.create({
      name,
      code,
      members: [userId],
      createdBy: userId,
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
