import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongoose'; // Your Mongoose connection helper
import { User } from '@/app/models/User';
// 2. Remove the 'mongodb' import, it's not needed
// import { ObjectId } from 'mongodb'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userId } = body;

    // 1. Validate the incoming data
    if (!subscription || !userId) {
      return NextResponse.json({ message: 'Missing subscription or user ID' }, { status: 400 });
    }

    // 2. Connect to the database
    await connectToDB(); // This just ensures the Mongoose connection is active
    
    // 3. Find the user by their ID and update their document
    //    We use the Mongoose 'User' model here, not the native 'db' object.
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { notificationSubscription: subscription } },
        { new: true }
        // Set the new field
    );

    if (updatedUser.modifiedCount === 0) {
      console.warn(`Could not find user with ID: ${userId} to save subscription.`);
    }

    return NextResponse.json({ message: 'Subscription saved successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error saving subscription:", error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}