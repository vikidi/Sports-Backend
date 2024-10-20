export {}; // This is to combat the TS2451 error

const Group = require("../models/group");
const Route = require("../models/route");

const create = (req, res) => {
  let createdGroup;
  Group.create({
    user: req.user.id,
    route: req.body.routeId,
    exercises: [],
  })
    .then((data) => {
      const { user, ...newData } = data._doc;
      createdGroup = newData;
      return Route.findById(req.body.routeId);
    })
    .then((route) => {
      if (!route.groups.length) route.defaultGroup = createdGroup._id;
      route.groups.push(createdGroup._id);
      return route.save();
    })
    .then(() => {
      return res.json(createdGroup);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const myList = (req, res) => {
  Group.find({ user: req.user.id }, "exercises name description")
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const getOne = (req, res) => {
  Group.findById(req.params.id, "user route exercises name description")
    .populate(
      "exercises",
      "sport startingEpoch parsedDate averageHeartRate averagePace averageCadence averageWatts distanceMeters elapsedSec"
    )
    .then((data) => {
      if (!data) return res.sendStatus(404);
      if (data.user !== req.user.id) return res.sendStatus(403);

      const { user, ...sendData } = data._doc;
      return res.json(sendData);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const deleteOne = async (req, res) => {
  // TODO: Exercises connected to the group?
  // TODO: Default group?

  try {
    const group = await Group.findById(req.params.id);

    if (group.user !== req.user.id)
      return res.status(403).json({ errors: ["Not authorized."] });

    const route = await Route.findById(group.route);

    route.groups = route.groups.filter((x) => x._id !== req.params.id);
    await route.save();
    await group.deleteOne();
    return res.json({});
  } catch (error) {
    return res.status(error.status ?? 500).json({ errors: [error.message] });
  }
};

module.exports = {
  create,
  myList,
  getOne,
  deleteOne,
};
