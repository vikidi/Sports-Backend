export {}; // This is to combat the TS2451 error

import express from "express";
import { body, param } from "express-validator";
import multer, { memoryStorage } from "multer";
import {
  create,
  myList,
  getOne,
  updateGroup,
  deleteOne,
} from "../controllers/exercise";
import { validRequest } from "../middleware/validateRequest";

const upload = multer({ storage: memoryStorage() });

const router = express.Router();

router.post("", upload.single("exercise"), create);

router.get("/my-list", myList);

/**
 * Get one own exercise
 */
router.get("/:id", [param("id").isMongoId()], validRequest, getOne);

/**
 * Delete one own exercise
 */
router.delete("/:id", [param("id").isMongoId()], validRequest, deleteOne);

// TODO: Patch?
router.post(
  "/:id/update-group",
  [body("newGroup").isString()],
  validRequest,
  updateGroup
);

export default router;
