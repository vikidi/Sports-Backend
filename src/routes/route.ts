export {}; // This is to combat the TS2451 error

import express from "express";

import { create, myList, getOne, deleteOne } from "../controllers/route";

const router = express.Router();

router.post("/create", create);

router.get("/my-list", myList);

router.get("/:id", getOne);

router.delete("/:id", deleteOne);

export default router;
