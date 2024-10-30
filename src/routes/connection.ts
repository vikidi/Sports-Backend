export {}; // This is to combat the TS2451 error

import express from "express";
import { polarWebhook } from "../controllers/connection";

const router = express.Router();

router.post("/polar-webhook", polarWebhook);

export default router;
