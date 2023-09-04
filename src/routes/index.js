const express = require("express");

const user = require("./user");
const connection = require("./connection");
const exercise = require("./exercise");
const route = require("./route");
const group = require("./group");

const router = express.Router();

router.use("/user", user);
router.use("/connection", connection);
router.use("/exercise", exercise);
router.use("/route", route);
router.use("/group", group);

module.exports = router;
