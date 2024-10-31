export {}; // This is to combat the TS2451 error

import express from "express";

import { create, getAll, getOne, deleteOne } from "../controllers/route";

const router = express.Router();

router.post("", create);

router.get("", getAll);

router.get("/:id", getOne);

router.delete("/:id", deleteOne);

export default router;
