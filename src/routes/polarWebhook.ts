export {}; // This is to combat the TS2451 error

import express from "express";
import { webhookCall } from "../controllers/polarWebhook";

const router = express.Router();

router.post("", webhookCall);

export default router;
