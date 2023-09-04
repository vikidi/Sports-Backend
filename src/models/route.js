const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const routeSchema = new Schema({
  user: { type: String, ref: "User" },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  defaultGroup: { type: Schema.Types.ObjectId, ref: "Group" },
  name: {
    type: String,
    default: "Default Name",
  },
  description: {
    type: String,
    default: "Example description",
  },
  useAutomaticGrouping: {
    type: Boolean,
    default: false,
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

routeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Route = model("Route", routeSchema);

module.exports = Route;
