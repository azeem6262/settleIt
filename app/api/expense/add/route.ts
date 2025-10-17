// app/api/expense/add/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongoose";
import Expense from "@/app/models/Expense";
import { User } from "@/app/models/user";
import webpush from "web-push";

// --- FIX: Define a type for the expected request body ---
interface AddExpenseRequestBody {
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  type: string;
}

export async function POST(req: Request) {
  await connectToDB();
  
  // --- FIX: Type the destructured variables ---
  const { groupId, description, amount, paidBy, splitAmong, type }: AddExpenseRequestBody = await req.json();

  // Ensure all IDs are correctly formatted as ObjectIds
  const parsedSplitAmong = splitAmong.map((id: string) => new mongoose.Types.ObjectId(id));
  const paidById = new mongoose.Types.ObjectId(paidBy);
  const groupIdObj = new mongoose.Types.ObjectId(groupId);

  try {
    const newExpense = await Expense.create({
        groupId: groupIdObj,
        description,
        amount,
        paidBy: paidById,
        splitAmong: parsedSplitAmong,
        type,
    });
    console.log("✅ Created Expense:", newExpense);

    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const payer = await User.findById(paidById);
    if (!payer) throw new Error("Payer not found");
    
    const userIdsToNotify = parsedSplitAmong.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(paidById)
    );

    if (userIdsToNotify.length > 0) {
      const usersToNotify = await User.find({ _id: { $in: userIdsToNotify } });
      const amountPerPerson = (amount / parsedSplitAmong.length).toFixed(2);
      
      for (const user of usersToNotify) {
        if (user.notificationSubscription) {
          const payload = JSON.stringify({
            title: 'New Expense Added!',
            body: `${payer.name} added a new expense: "${description}". You owe ₹${amountPerPerson}.`
          });

          try {
            await webpush.sendNotification(user.notificationSubscription, payload);
            console.log(`✅ Notification sent to ${user.name}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to ${user.name}:`, error);
          }
        }
      }
    }

    return NextResponse.json(newExpense);
    
  } catch (err: unknown) { // --- FIX: Use 'unknown' instead of 'any' ---
    console.error("Error adding expense:", err);
    let errorMessage = "Failed to add expense";
    if (err instanceof Error) {
        errorMessage = err.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}