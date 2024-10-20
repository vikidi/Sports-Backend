export {}; // This is to combat the TS2451 error

const express = require("express");

const user = require("./user");
const connection = require("./connection");
const exercise = require("./exercise");
const route = require("./route");
const group = require("./group");

const router = express.Router();

router.use("/users", user);
router.use("/connections", connection);
router.use("/exercises", exercise);
router.use("/routes", route);
router.use("/groups", group);

module.exports = router;
