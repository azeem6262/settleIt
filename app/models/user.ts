import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  name: { type: String },
  role: { type: String, enum: ["student", "admin"], default: "student" },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
