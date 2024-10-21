export {}; // This is to combat the TS2451 error

import fs from "fs";
import temp from "temp";
import { Parser } from "tcx-js";

const Exercise = require("../models/exercise");

const { roundTo } = require("../utils");

temp.track();

const createNew = (
  userId: string,
  dataBuffer: string | NodeJS.ArrayBufferView
) => {
  return new Promise<void>((resolve, reject) => {
    temp.open("exercise", (err, info) => {
      if (err) return reject(Error("Server failure."));

      fs.writeFileSync(info.fd, dataBuffer);

      const parser = new Parser(info.path);
      const activity = parser.activity;

      const calcStart = {
        heartRateCount: 0,
        cadenceCount: 0,
        wattsCount: 0,
      };

      const reduceValues = activity.trackpoints.reduce((total, next) => {
        total.heartRateCount += next["heart_rate_bpm"] ?? 0;
        total.cadenceCount += next.cadence ?? 0;
        if (next.watts) total.wattsCount += next.watts;
        return total;
      }, calcStart);

      const tpCount = activity.trackpoints.length;

      const distanceMeters =
        activity.trackpoints[activity.trackpoints.length - 1][
          "distance_meters"
        ];
      const elapsedSeconds =
        activity.trackpoints[activity.trackpoints.length - 1]["elapsed_sec"];

      Exercise.create({
        user: userId,
        group: null,
        sport: activity.sport,
        startingEpoch: activity.startingEpoch,
        parsedDate: activity.activityId,
        averageHeartRate: Math.round(reduceValues.heartRateCount / tpCount),
        averageCadence: Math.round(reduceValues.cadenceCount / tpCount),
        averageWatts:
          reduceValues.wattsCount !== 0
            ? Math.round(reduceValues.wattsCount / tpCount)
            : null,
        averagePace: roundTo(
          elapsedSeconds ?? 0 / 60 / (distanceMeters ?? 0 / 1000),
          2
        ),
        distanceMeters: distanceMeters,
        elapsedSec: elapsedSeconds,
        trackPoints: activity.trackpoints.map((tp) => {
          return {
            latitude: tp.latitude,
            longitude: tp.longitude,
            altitudeMeters: tp["altitude_meters"],
            elapsedSec: tp["elapsed_sec"],
          };
        }),
      })
        .then(() => {
          return resolve();
        })
        .catch(() => {
          return reject(Error("Server failure."));
        });
    });
  });
};

module.exports = {
  createNew,
};
