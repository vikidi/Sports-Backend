export {}; // This is to combat the TS2451 error

import { Request, Response } from "express";
import { Route } from "../models/route";

const create = (req: Request, res: Response) => {
  Route.create({
    user: req.user!.id,
    groups: [],
    defaultGroup: null,
  })
    .then((data) => {
      const { user, ...newData } = data;
      return res.json(newData);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const myList = (req: Request, res: Response) => {
  Route.find(
    { user: req.user!.id },
    "groups defaultGroup name description useAutomaticGrouping"
  )
    .populate("groups", "exercises name description")
    .populate({
      path: "defaultGroup",
      select: "exercises name description",
      populate: { path: "exercises", select: "distanceMeters" },
    })
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const getOne = (req: Request, res: Response) => {
  Route.findById(
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
    })
    .then((data) => {
      if (!data) return res.sendStatus(404);
      if (data.user !== req.user!.id) return res.sendStatus(403);

      const { user, ...sendData } = data;
      return res.json(sendData);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const deleteOne = (req: Request, res: Response) => {
  Route.findOneAndDelete({ _id: req.params.id, user: req.user!.id })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

module.exports = {
  create,
  myList,
  getOne,
  deleteOne,
};
