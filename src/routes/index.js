const express = require("express");

const user = require("./user");
const connection = require("./connection");
const exercise = require("./exercise");

const router = express.Router();

router.use("/user", user);
router.use("/connection", connection);
router.use("/exercise", exercise);

module.exports = router;
