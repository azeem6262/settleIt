import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    description: { type: String, required: true }, // e.g. "Dinner", "Electricity"
    amount: { type: Number, required: true },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitAmong: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Meals & Dining', 'Stationary & Supplies', 'Academic & Work Essentials', 'Group Outings & Activities', 'Other'],
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
