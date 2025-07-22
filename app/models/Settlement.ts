import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISettlement extends Document {
  groupId: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  amount: number;
  settledAt: Date;
}

const SettlementSchema: Schema<ISettlement> = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  settledAt: { type: Date, default: Date.now },
});

export default mongoose.models.Settlement ||
  mongoose.model<ISettlement>("Settlement", SettlementSchema);
