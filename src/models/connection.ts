export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const connectionSchema = new Schema(
  {
    _id: { type: String, required: true },
    externalId: { type: String, required: true },
    events: { type: [String], required: true },
    url: { type: String, required: true },
    signatureSecretKey: { type: String, required: true },
  },
  { timestamps: true }
);

const Connection = model("Connection", connectionSchema);

export default Connection;
