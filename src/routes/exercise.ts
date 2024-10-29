export {}; // This is to combat the TS2451 error

import express from "express";
import { body, param } from "express-validator";

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
router.get(
  "/:id",
  [param("id").isMongoId()],
  validRequest,
  async (req: express.Request, res: express.Response) => getOne(req, res)
);

/**
 * Delete one own exercise
 */
router.delete(
  "/:id",
  [param("id").isMongoId()],
  validRequest,
  async (req: express.Request, res: express.Response) => deleteOne(req, res)
);

// TODO: Patch?
router.post(
  "/:id/update-group",
  [body("newGroup").isString()],
  validRequest,
  async (req: express.Request, res: express.Response) => updateGroup(req, res)
);

export default router;
