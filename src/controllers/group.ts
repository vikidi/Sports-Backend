export {}; // This is to combat the TS2451 error

import { Response } from "express";
import { AuthenticatedRequest } from "../common/types";
import { Group } from "../models/group";
import { Route } from "../models/route";

const create = (req: AuthenticatedRequest, res: Response) => {
  let createdGroup: any; // TODO: fix
  Group.create({
    user: req.user.id,
    route: req.body.routeId,
    exercises: [],
  })
    .then((data) => {
      const { user, ...newData } = data;
      createdGroup = newData;
      return Route.findById(req.body.routeId);
    })
    .then((route) => {
      if (!route!.groups.length) route!.defaultGroup = createdGroup._id;
      route!.groups.push(createdGroup._id);
      return route!.save();
    })
    .then(() => {
      return res.json(createdGroup);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const myList = (req: AuthenticatedRequest, res: Response) => {
  Group.find({ user: req.user.id }, "exercises name description")
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const getOne = (req: AuthenticatedRequest, res: Response) => {
  Group.findById(req.params.id, "user route exercises name description")
    .populate(
      "exercises",
      "sport startingEpoch parsedDate averageHeartRate averagePace averageCadence averageWatts distanceMeters elapsedSec"
    )
    .then((data) => {
      if (!data) return res.sendStatus(404);
      if (data.user !== req.user.id) return res.sendStatus(403);

      const { user, ...sendData } = data;
      return res.json(sendData);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const deleteOne = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);

    if (group == null || group.user !== req.user.id)
      return res.status(403).json({ errors: ["Not authorized."] });

    const route = await Route.findById(group); // TODO: Not working! Find the route for the group

    route!.groups = route!.groups.filter(
      (x) => x._id.toString() !== req.params.id
    );
    await route!.save();
    await group.deleteOne();
    return res.json({});
  } catch (error: any) {
    return res.status(error.status ?? 500).json({ errors: [error.message] });
  }
};

module.exports = {
  create,
  myList,
  getOne,
  deleteOne,
};
