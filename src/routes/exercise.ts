export {}; // This is to combat the TS2451 error

const express = require("express");
const { body, param } = require("express-validator");

const {
  create,
  myList,
  getOne,
  updateGroup,
  deleteOne,
} = require("../controllers/exercise");

const { validRequest } = require("../utils");

const router = express.Router();

router.post("", async (req, res) => create(req, res));

router.get("/my-list", async (req, res) => myList(req, res));

/**
 * Get one own exercise
 */
router.get("/:id", [param("id").isMongoId()], validRequest, async (req, res) =>
  getOne(req, res)
);

/**
 * Delete one own exercise
 */
router.delete(
  "/:id",
  [param("id").isMongoId()],
  validRequest,
  async (req, res) => deleteOne(req, res)
);

// TODO: Patch?
router.post(
  "/:id/update-group",
  [body("newGroup").isString()],
  validRequest,
  async (req, res) => updateGroup(req, res)
);

module.exports = router;
