const express = require("express");
const { body } = require("express-validator");

const { create, myList, getOne } = require("../controllers/group");

const { validRequest } = require("../utils");

const router = express.Router();

router.post(
  "/create",
  [body("routeId").not().isEmpty()],
  validRequest,
  async (req, res) => create(req, res)
);

router.get("/my-list", async (req, res) => myList(req, res));

router.get("/:id", async (req, res) => getOne(req, res));

module.exports = router;
