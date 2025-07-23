import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Expense from "@/app/models/Expense";
import { connectToDB } from "@/app/lib/mongoose";
import { User } from "@/app/models/user";
export async function GET() {
  await connectToDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return Response.json({}, { status: 401 });
  }

  const userEmail = session.user.email;

  try {
    // Get user's ID from the User model if needed
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return Response.json({}, { status: 404 });
    }

    const summary = await Expense.aggregate([
      { $match: { paidBy: user._id } }, // filter only user's expenses
      {
        $group: {
          _id: "$type", // group by type: 'Food', 'Outings', etc.
          total: { $sum: "$amount" },
        },
      },
    ]);

    const formatted = summary.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {} as Record<string, number>);

    return Response.json(formatted);
  } catch (err) {
    console.error("Aggregation error:", err);
    return Response.json({}, { status: 500 });
  }
}
