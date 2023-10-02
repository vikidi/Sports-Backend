const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const groupSchema = new Schema({
  user: { type: String, ref: "User" },
  route: { type: Schema.Types.ObjectId, ref: "Route" },
  exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
  name: {
    type: String,
    default: "Default Name",
  },
  description: {
    type: String,
    default: "Example description",
  },
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

groupSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Group = model("Group", groupSchema);

module.exports = Group;
