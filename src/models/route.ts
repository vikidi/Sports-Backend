export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const routeSchema = new Schema(
  {
    user: { type: String, ref: "User" },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    defaultGroup: { type: Schema.Types.ObjectId, ref: "Group" }, // TODO: should this be groups own info?
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
  },
  { timestamps: true }
);

const Route = model("Route", routeSchema);

export default Route;
