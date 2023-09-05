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
    "_id sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts"
  )
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

const getOne = (req, res) => {
  Exercise.findById(
    req.params.id,
    "_id user group sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts"
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
