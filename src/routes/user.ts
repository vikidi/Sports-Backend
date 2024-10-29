export {}; // This is to combat the TS2451 error

import express from "express";
import { body } from "express-validator";

import { validRequest } from "../utils";

const { polarToken, create, getSelf } = require("../controllers/user");

const router = express.Router();

router.get("/self", async (req, res) => getSelf(req, res));

router.post("/create", async (req, res) => create(req, res));

router.post(
  "/polar-token",
  [body("code").not().isEmpty()],
  validRequest,
  async (req: express.Request, res: express.Response) => polarToken(req, res)
);

export default router;
