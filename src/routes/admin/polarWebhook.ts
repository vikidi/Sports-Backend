export {}; // This is to combat the TS2451 error

import express from "express";
import {
  activateWebhookConnection,
  deactivateWebhookConnection,
  getWebhookConnection,
} from "../../controllers/admin/polarWebhook";
import { requiredScopes } from "express-oauth2-jwt-bearer";

const router = express.Router();

router.get("", requiredScopes("read:admin"), getWebhookConnection);
router.post(
  "/activate",
  requiredScopes("update:admin"),
  activateWebhookConnection
);
router.post(
  "/deactivate",
  requiredScopes("update:admin"),
  deactivateWebhookConnection
);

export default router;
