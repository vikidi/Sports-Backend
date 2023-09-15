const Route = require("../models/route");

const create = (req, res) => {
  Route.create({
    user: req.user.id,
    groups: [],
    defaultGroup: null,
  })
    .then((data) => {
      const { user, ...newData } = data._doc;
      return res.json(newData);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const myList = (req, res) => {
  Route.find(
    { user: req.user.id },
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

const getOne = (req, res) => {
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
