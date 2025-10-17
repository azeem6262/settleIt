// app/api/expense/add/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { User } from "@/app/models/user";
import webpush from "web-push";

export async function POST(req: Request) {
  await connectToDB();
  const { groupId, description, amount, paidBy, splitAmong, type } = await req.json();

  // Ensure all IDs are correctly formatted as ObjectIds
  const parsedSplitAmong = splitAmong.map((id: string) => new mongoose.Types.ObjectId(id));
  const paidById = new mongoose.Types.ObjectId(paidBy);
  const groupIdObj = new mongoose.Types.ObjectId(groupId);

  try {
    // --- 1. Your existing logic to save the expense (unchanged) ---
    const newExpense = await Expense.create({
        groupId: groupIdObj,
        description,
        amount,
        paidBy: paidById,
        splitAmong: parsedSplitAmong,
        type,
    });
    console.log("✅ Created Expense:", newExpense);

    // --- 2. NEW: Notification Logic ---

    // Configure web-push with your VAPID keys from Vercel's environment variables
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Your contact email
      process.env.NEXT_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // Find the name of the person who paid
    const payer = await User.findById(paidById);
    if (!payer) throw new Error("Payer not found");
    
    // Find all users who need to be notified (everyone in the split except the payer)
    const userIdsToNotify = parsedSplitAmong.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(paidById)
    );

    if (userIdsToNotify.length > 0) {
      const usersToNotify = await User.find({ _id: { $in: userIdsToNotify } });

      // Calculate the amount each person owes
      const amountPerPerson = (amount / parsedSplitAmong.length).toFixed(2);
      
      // Send a notification to each one
      for (const user of usersToNotify) {
        if (user.notificationSubscription) {
          const payload = JSON.stringify({
            title: 'New Expense Added!',
            body: `${payer.name} added a new expense: "${description}". You owe $${amountPerPerson}.`
          });

          try {
            await webpush.sendNotification(user.notificationSubscription, payload);
            console.log(`✅ Notification sent to ${user.name}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to ${user.name}:`, error);
            // In a production app, if error.statusCode is 410 (Gone), 
            // you would remove the invalid subscription from the user's document.
          }
        }
      }
    }

    return NextResponse.json(newExpense);
    
  } catch (err: any) {
    console.error("Error adding expense:", err);
    return NextResponse.json({ message: "Failed to add expense", error: err.message }, { status: 500 });
  }
}