export {}; // This is to combat the TS2451 error

import { Schema, model } from "mongoose";

const exerciseSchema = new Schema(
  {
    user: { type: String, ref: "User" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    sport: String,
    startingEpoch: Number,
    parsedDate: Date,
    averageHeartRate: Number,
    averagePace: Number,
    averageCadence: Number,
    averageWatts: Number,
    distanceMeters: Number,
    elapsedSec: Number,
    trackPoints: [
      {
        _id: false,
        latitude: Number,
        longitude: Number,
        altitudeMeters: Number,
        elapsedSec: Number,
      },
    ],
  },
  { timestamps: true }
);

const Exercise = model("Exercise", exerciseSchema);

export default Exercise;
