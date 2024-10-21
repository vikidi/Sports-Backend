export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const connectionSchema = new Schema(
  {
    _id: { type: String, required: true },
    externalId: String,
    events: [String],
    url: String,
    signatureSecretKey: String,
  },
  { timestamps: true }
);

const Connection = model("Connection", connectionSchema);

module.exports = Connection;
