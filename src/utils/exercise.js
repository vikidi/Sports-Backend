const tcx = require("tcx-js");
const temp = require("temp").track();
const fs = require("fs");

const Exercise = require("../models/exercise");

const { roundTo } = require("../utils");

const createNew = (userId, dataBuffer) => {
  return new Promise((resolve, reject) => {
    temp.open("exercise", (err, info) => {
      if (!err) {
        fs.writeFileSync(info.fd, dataBuffer);

        const parser = new tcx.Parser(info.path);
        const activity = parser.activity;

        // TODO: Max and min values?

        const calcStart = {
          heartRateCount: 0,
          cadenceCount: 0,
          wattsCount: 0,
        };

        const reduceValues = activity.trackpoints.reduce((total, next) => {
          total.heartRateCount += next["heart_rate_bpm"];
          total.cadenceCount += next.cadence;
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
            elapsedSeconds / 60 / (distanceMeters / 1000),
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
            return reject(Error({ status: 500, message: "Server failure." }));
          });
      } else {
        return reject(Error({ status: 500, message: "Server failure." }));
      }
    });
  });
};

module.exports = {
  createNew,
};
