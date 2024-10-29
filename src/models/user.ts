export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    polarId: Number,
    polarMemberId: String,
    polarToken: String,
    polarTokenCreatedAt: Date,
    polarTokenExpiresAt: Date,
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
