//For users registering through app
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in .env.local");
}

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;

  await mongoose.connect(MONGODB_URI, {
    dbName: "college-expense-splitter",
    bufferCommands: false,
  });

  isConnected = true;
  console.log("MongoDB Connected ✅");
};
