const express = require("express");
const { body } = require("express-validator");

const {
  create,
  myList,
  getOne,
  updateGroup,
  deleteOne,
} = require("../controllers/exercise");

const { validRequest } = require("../utils");

const router = express.Router();

router.post("/create", async (req, res) => create(req, res));

router.get("/my-list", async (req, res) => myList(req, res));

router.get("/:id", async (req, res) => getOne(req, res));

router.delete("/:id", async (req, res) => deleteOne(req, res));

router.post(
  "/:id/update-group",
  [body("newGroup").isString()],
  validRequest,
  async (req, res) => updateGroup(req, res)
);

module.exports = router;
