const Exercise = require("../models/exercise");
const Group = require("../models/group");

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
    "_id user group sport startingEpoch parsedDate distanceMeters elapsedSec averageHeartRate averagePace averageCadence averageWatts trackPoints"
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

const updateGroup = async (req, res) => {
  try {
    let exercise = await Exercise.findById(req.params.id, "_id user group");

    if (!exercise) return res.sendStatus(404);
    if (exercise.user !== req.user.id) return res.sendStatus(403);
    if (exercise.group === req.body.newGroup) return res.sendStatus(200);

    let newGroup;
    if (req.body.newGroup && req.body.newGroup !== "") {
      newGroup = await Group.findById(req.body.newGroup, "_id user exercises");

      if (!newGroup) return res.sendStatus(404);
      if (newGroup.user !== req.user.id) return res.sendStatus(403);
    }

    let oldGroup;
    if (exercise.group && exercise.group !== "") {
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

    return res.sendStatus(200);
  } catch (error) {
    return res.status(error.status ?? 500).json({ errors: [error.message] });
  }
};

const deleteOne = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) return res.status(404).json();
    if (exercise.user !== req.user.id) return res.status(403).json();

    const group = await Group.findById(exercise.group);

    if (group) {
      group.exercises.pull(exercise._id);
      await group.save();
    }

    await exercise.deleteOne();

    return res.status(204).json({});
  } catch (error) {
    return res.status(error.status ?? 500).json({ errors: [error.message] });
  }
};

module.exports = {
  create,
  myList,
  getOne,
  updateGroup,
  deleteOne,
};
