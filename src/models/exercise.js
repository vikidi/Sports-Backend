const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const exerciseSchema = new Schema({
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
      seq: Number,
      time: Date,
      latitude: Number,
      longitude: Number,
      altitudeMeters: Number,
      distanceMeters: Number,
      heartRateBpm: Number,
      speed: Number,
      cadence: Number,
      watts: Number,
      elapsedSec: Number,
      elapsedhhmmss: String,
      epochMs: Number,
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
    immutable: true,
  },
});

const Exercise = model("Exercise", exerciseSchema);

module.exports = Exercise;
