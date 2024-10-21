export {}; // This is to combat the TS2451 error

import express from "express";
import { body } from "express-validator";

const { create, myList, getOne, deleteOne } = require("../controllers/group");

const { validRequest } = require("../utils");

const router = express.Router();

router.post(
  "/create",
  [body("routeId").not().isEmpty()],
  validRequest,
  async (req: express.Request, res: express.Response) => create(req, res)
);

router.get("/my-list", async (req, res) => myList(req, res));

router.get("/:id", async (req, res) => getOne(req, res));

router.delete("/:id", async (req, res) => deleteOne(req, res));

module.exports = router;
