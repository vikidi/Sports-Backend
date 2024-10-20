export {}; // This is to combat the TS2451 error

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  _id: { type: String, required: true },
  polarId: Number,
  polarMemberId: String,
  polarToken: String,
  polarTokenCreatedAt: Date,
  polarTokenExpiresAt: Date,
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

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = model("User", userSchema);

module.exports = User;
