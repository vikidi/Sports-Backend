export {}; // This is to combat the TS2451 error

import express from "express";
import {
  activateWebhookConnection,
  createWebhookConnection,
  deactivateWebhookConnection,
  deleteWebhookConnection,
  getWebhookConnection,
  updateWebhookConnection,
} from "../../controllers/admin/polarWebhook";
import { requiredScopes } from "express-oauth2-jwt-bearer";

const router = express.Router();

router.get("", requiredScopes("read:admin"), getWebhookConnection);

router.post("", requiredScopes("create:admin"), createWebhookConnection);

router.delete("", requiredScopes("delete:admin"), deleteWebhookConnection);

router.patch("", requiredScopes("update:admin"), updateWebhookConnection);

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
