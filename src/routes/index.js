const express = require("express");

const user = require("./user");
const connection = require("./connection");

const router = express.Router();

router.use("/user", user);
router.use("/connection", connection);

module.exports = router;
