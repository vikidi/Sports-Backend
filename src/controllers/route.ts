export {}; // This is to combat the TS2451 error

import { Request, Response, NextFunction } from "express";
import Route from "../models/route";
import { AppError, HttpCode } from "../exceptions/AppError";

export const create = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const route = await Route.create({
    user: req.user!.id,
    groups: [],
    defaultGroup: null,
  });

  const { user, ...newData } = route;
  res.json(newData);
};

export const getAll = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const route = await Route.find(
    { user: req.user!.id },
    "groups defaultGroup name description useAutomaticGrouping"
  )
    .populate("groups", "exercises name description")
    .populate({
      path: "defaultGroup",
      select: "exercises name description",
      populate: { path: "exercises", select: "distanceMeters" },
    })
    .exec();

  res.json(route);
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const route = await Route.findById(
    req.params.id,
    "user groups defaultGroup name description useAutomaticGrouping"
  )
    .populate({
      path: "groups",
      select: "exercises name description",
      populate: {
        path: "exercises",
        select: "startingEpoch elapsedSec averagePace averageHeartRate",
      },
    })
    .populate({
      path: "defaultGroup",
      select: "exercises name description",
      populate: { path: "exercises", select: "distanceMeters" },
    });

  if (!route) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Route not found.",
      })
    );
  }

  if (route.user !== req.user!.id) {
    return next(
      new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "User unauthorized.",
      })
    );
  }

  const { user, ...sendData } = route;
  res.json(sendData);
};

export const deleteOne = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  await Route.findOneAndDelete({ _id: req.params.id, user: req.user!.id });

  // TODO: Group? Exercises?

  res.status(HttpCode.NO_CONTENT).json();
};
