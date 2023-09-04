const Exercise = require("../models/exercise");

const { createNew } = require("../utils/exercise");

const create = (req, res) => {
  createNew(req.user.id, req.files.exercise.data)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const myList = (req, res) => {
  Exercise.find(
    { user: req.user.id },
    "_id sport parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence: 1,"
  )
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

module.exports = {
  create,
  myList,
};
