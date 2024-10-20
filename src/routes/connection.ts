export {}; // This is to combat the TS2451 error

const express = require("express");

const { polarWebhook } = require("../controllers/connection");

const router = express.Router();

router.post("/polar-webhook", async (req, res) => polarWebhook(req, res));

module.exports = router;