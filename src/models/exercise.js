const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const exerciseSchema = new Schema({
  user: { type: String, ref: "User" },
  sport: String,
  startingEpoch: Number,
  parsedDate: Date,
  averageHeartRate: Number,
  averagePace: Number,
  averageCadence: Number,
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
});

const Exercise = model("Exercise", exerciseSchema);

module.exports = Exercise;
