export {}; // This is to combat the TS2451 error

import { Request, Response, NextFunction } from "express";
import Group from "../models/group";
import Route from "../models/route";
import { AppError, HttpCode } from "../exceptions/AppError";

export const create = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const group = await Group.create({
    user: req.user!.id,
    route: req.body.routeId,
    exercises: [],
  });

  const { user, ...createdGroup } = group;
  const route = await Route.findById(req.body.routeId);

  if (!route!.groups.length) route!.defaultGroup = createdGroup._id;
  route!.groups.push(createdGroup._id);

  await route!.save();

  res.json(createdGroup);
};

export const getAll = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const group = await Group.find(
    { user: req.user!.id },
    "exercises name description"
  ).exec();

  res.json(group);
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const group = await Group.findById(
    req.params.id,
    "user route exercises name description"
  ).populate(
    "exercises",
    "sport startingEpoch parsedDate averageHeartRate averagePace averageCadence averageWatts distanceMeters elapsedSec"
  );

  if (!group) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Group not found.",
      })
    );
  }

  if (group.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  const { user, ...sendData } = group;
  res.json(sendData);
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Group not found.",
      })
    );
  }

  if (group.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  if (group.route) {
    const route = await Route.findById(group.route);

    route!.groups = route!.groups.filter(
      (x) => x._id.toString() !== req.params.id
    );

    await route!.save();
  }

  // TODO: Fix exercises

  await group.deleteOne();

  res.status(HttpCode.NO_CONTENT).json();
};
