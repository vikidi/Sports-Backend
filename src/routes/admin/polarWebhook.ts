export {}; // This is to combat the TS2451 error

import express from "express";
import { get } from "../../controllers/admin/polarWebhook";
import { requiredScopes } from "express-oauth2-jwt-bearer";

const router = express.Router();

router.get("", requiredScopes("read:admin"), get);

export default router;
