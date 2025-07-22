import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import { User } from "@/app/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    await connectToDB();
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({ token, user: { name: user.name, role: user.role } }, { status: 200 });
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


