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

  res.json();
};

export const myList = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const exercise = await Exercise.find(
    { user: req.user!.id },
    "_id sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts"
  ).exec();

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

export const updateGroup = async (
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

  if (exercise.group === req.body.newGroup) {
    res.json();
    return;
  }

  let newGroup;
  if (req.body.newGroup && req.body.newGroup !== "") {
    newGroup = await Group.findById(req.body.newGroup, "_id user exercises");

    if (!newGroup) {
      return next(
        new AppError({
          httpCode: HttpCode.NOT_FOUND,
          description: "Group not found.",
        })
      );
    }

    if (newGroup.user !== req.user!.id) {
      return next(
        new AppError({
          httpCode: HttpCode.FORBIDDEN,
          description: "User unauthorized.",
        })
      );
    }
  }

  let oldGroup;
  if (exercise.group && exercise.group.toString() !== "") {
    oldGroup = await Group.findById(exercise.group, "_id exercises");
  }

  exercise.group = req.body.newGroup !== "" ? req.body.newGroup : null;
  await exercise.save();

  if (newGroup) {
    newGroup.exercises = [...newGroup.exercises, exercise._id];
    await newGroup.save();
  }

  if (oldGroup) {
    const index = oldGroup.exercises.indexOf(exercise._id);
    if (index > -1) {
      let newArray = [...oldGroup.exercises];
      newArray.splice(index, 1);
      oldGroup.exercises = newArray;
      await oldGroup.save();
    }
  }

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
