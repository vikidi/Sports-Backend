const Group = require("../models/group");
const Route = require("../models/route");

const create = (req, res) => {
  let createdGroup;
  Group.create({
    user: req.user.id,
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
      console.log(err);
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
  Group.findById(req.params.id, "user exercises name description")
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

module.exports = {
  create,
  myList,
  getOne,
};
