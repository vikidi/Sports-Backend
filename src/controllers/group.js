const Group = require("../models/group");

const create = (req, res) => {
  Group.create({
    user: req.user.id,
    exercises: [],
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
  Group.find({ user: req.user.id }, "exercises name description")
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
