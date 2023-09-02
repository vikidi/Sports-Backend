const express = require("express");
const { body } = require("express-validator");

const { validRequest } = require("../utils");

const { polarToken, create, getSelf } = require("../controllers/user");

const router = express.Router();

router.get("/self", async (req, res) => getSelf(req, res));

router.post("/create", async (req, res) => create(req, res));

router.post(
  "/polar-token",
  [body("code").not().isEmpty()],
  validRequest,
  async (req, res) => polarToken(req, res)
);

module.exports = router;
