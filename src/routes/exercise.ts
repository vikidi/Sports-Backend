export {}; // This is to combat the TS2451 error

import express from "express";
import { body, param } from "express-validator";
import multer, { memoryStorage } from "multer";
import {
  create,
  getAll,
  getOne,
  patch,
  deleteOne,
} from "../controllers/exercise";
import { validRequest } from "../middleware/validateRequest";

const upload = multer({ storage: memoryStorage() });

const router = express.Router();

/**
 * Create one exercise
 */
router.post("", upload.single("exercise"), create);

/**
 * Get all own exercises
 */
router.get("", getAll);

/**
 * Get one own exercise
 */
router.get("/:id", [param("id").isMongoId()], validRequest, getOne);

/**
 * Delete one own exercise
 */
router.delete("/:id", [param("id").isMongoId()], validRequest, deleteOne);

router.patch("/:id", patch);

export default router;
