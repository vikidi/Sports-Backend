const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const connectionSchema = new Schema({
  _id: { type: String, required: true },
  externalId: String,
  events: [String],
  url: String,
  signatureSecretKey: String,
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

connectionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Connection = model("Connection", connectionSchema);

module.exports = Connection;
