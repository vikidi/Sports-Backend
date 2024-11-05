export {}; // This is to combat the TS2451 error

import express from "express";

import polarWebhook from "./polarWebhook";

const adminRouter = express.Router();

adminRouter.use("/polar-webhook", polarWebhook);

export default adminRouter;
