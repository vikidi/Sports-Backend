export {}; // This is to combat the TS2451 error

import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { validRequest } from "../middleware/validateRequest";

import { polarToken, create, getSelf } from "../controllers/user";

const router = express.Router();

router.get("/self", async (req, res, next) => getSelf(req, res, next));

router.post("/create", async (req, res, next) => create(req, res, next));

router.post(
  "/polar-token",
  [body("code").not().isEmpty()],
  validRequest,
  async (req: Request, res: Response, next: NextFunction) =>
    polarToken(req, res, next)
);

export default router;
