export {}; // This is to combat the TS2451 error

import express from "express";
import { body } from "express-validator";
import { create, getAll, getOne, deleteOne } from "../controllers/group";
import { validRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post("", [body("routeId").not().isEmpty()], validRequest, create);

router.get("", getAll);

router.get("/:id", getOne);

router.delete("/:id", deleteOne);

export default router;
