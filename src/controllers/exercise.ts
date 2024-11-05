export {}; // This is to combat the TS2451 error

import { Request, Response, NextFunction } from "express";
import Group from "../models/group";
import Exercise from "../models/exercise";
import { createNew } from "../utils/exercise";
import { removeItemAll } from "../utils";
import { AppError, HttpCode } from "../exceptions/AppError";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(
      new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "File not uploaded correctly.",
      })
    );
  }

  await createNew(req.user!.id, req.file.buffer);

  res.status(HttpCode.NO_CONTENT).json();
};

export const getAll = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const exercise = await Exercise.find(
    { user: req.user!.id },
    "_id sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts"
  );

  res.json(exercise);
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const exercise = await Exercise.findById(
    req.params.id,
    "_id user group sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts trackPoints"
  );

  if (!exercise) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Exercise not found.",
      })
    );
  }

  if (exercise.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  const { user, ...sendData } = exercise.toObject();
  res.json(sendData);
};

export const patch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const exercise = await Exercise.findById(req.params.id, "_id user group");

  if (!exercise) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Exercise not found.",
      })
    );
  }

  if (exercise.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  // Update groups' references to this exercise
  if (exercise.group !== req.body.group) {
    let newGroup;
    if (req.body.group && req.body.group !== "") {
      newGroup = await Group.findById(req.body.group, "_id user exercises");

      if (!newGroup) {
        return next(
          new AppError({
            httpCode: HttpCode.NOT_FOUND,
            description: "New group not found.",
          })
        );
      }

      if (newGroup.user !== req.user!.id) {
        return next(
          new AppError({
            httpCode: HttpCode.FORBIDDEN,
            description: "User unauthorized to use the new group.",
          })
        );
      }
    }

    let oldGroup;
    if (exercise.group && exercise.group.toString() !== "") {
      oldGroup = await Group.findById(exercise.group, "_id exercises");
    }

    if (newGroup) {
      newGroup.exercises = [...newGroup.exercises, exercise._id];
      await newGroup.save();
    }

    if (oldGroup) {
      oldGroup.exercises = removeItemAll(oldGroup.exercises, exercise._id);
      await oldGroup.save();
    }
  }

  // Group is the only property that can be changed by the user
  exercise.group = req.body.group !== "" ? req.body.group : null;
  await exercise.save();

  res.json();
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Exercise not found.",
      })
    );
  }

  if (exercise.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  const group = await Group.findById(exercise.group);

  if (group) {
    group.exercises = removeItemAll(group.exercises, exercise._id);
    await group.save();
  }

  await exercise.deleteOne();

  res.status(HttpCode.NO_CONTENT).json();
};
