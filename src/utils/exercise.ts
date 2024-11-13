export {}; // This is to combat the TS2451 error

import fs from "fs";
import temp from "temp";
import { Parser } from "tcx-js";
import Exercise from "../models/exercise";
import { roundTo } from "../utils";
import { AppError, HttpCode } from "../exceptions/AppError";

temp.track();

export const createNew = (
  userId: string,
  dataBuffer: NodeJS.ArrayBufferView
) => {
  let createdExercise;
  temp.open("exercise", async (err, info) => {
    if (err) {
      throw new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Exercise save failed.",
      });
    }

    fs.writeFileSync(info.fd, dataBuffer);

    let parser;
    try {
      parser = new Parser(info.path);
    } catch {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "File format incorrect.",
      });
    }

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
      activity.trackpoints[activity.trackpoints.length - 1]["distance_meters"];
    const elapsedSeconds =
      activity.trackpoints[activity.trackpoints.length - 1]["elapsed_sec"];

    createdExercise = await Exercise.create({
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
        (elapsedSeconds ?? 0) / 60 / ((distanceMeters ?? 0) / 1000),
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
    });
  });

  return createdExercise;
};
