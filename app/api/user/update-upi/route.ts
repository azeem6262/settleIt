// In app/api/user/update-upi/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongoose';
import { User } from '@/app/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { upiId } = await request.json();
    if (!upiId) {
      return NextResponse.json({ message: 'UPI ID is required' }, { status: 400 });
    }

    await connectToDB();

    await User.findByIdAndUpdate(session.user.id, {
      $set: { upiId: upiId }
    });

    return NextResponse.json({ message: 'UPI ID updated successfully' }, { status: 200 });

  } catch (error: unknown) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}