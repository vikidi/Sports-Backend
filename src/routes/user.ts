export {}; // This is to combat the TS2451 error

import express from "express";
import { body } from "express-validator";
import { validRequest } from "../middleware/validateRequest";

import { polarToken, create, getSelf } from "../controllers/user";

const router = express.Router();

router.get("", getSelf);

router.post("", create);

router.post(
  "/polar-token",
  [body("code").not().isEmpty()],
  validRequest,
  polarToken
);

export default router;
