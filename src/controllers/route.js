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
  Route.find({ user: req.user.id }, "groups defaultGroup name description")
    .populate("groups", "exercises name description")
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
