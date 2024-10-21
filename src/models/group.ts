export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    user: { type: String, ref: "User" },
    exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    name: {
      type: String,
      default: "Default Name",
    },
    description: {
      type: String,
      default: "Example description",
    },
  },
  { timestamps: true }
);

export const Group = model("Group", groupSchema);
