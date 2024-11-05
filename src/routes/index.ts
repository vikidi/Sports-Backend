export {}; // This is to combat the TS2451 error

import express from "express";

import user from "./user";
import polarWebhook from "./polarWebhook";
import exercise from "./exercise";
import route from "./route";
import group from "./group";
import adminRouter from "./admin";

const baseRouter = express.Router();
const publicRouter = express.Router();
const authenticatedRouter = express.Router();

publicRouter.use("/connections/polar-webhook", polarWebhook);

authenticatedRouter.use("/users", user);
authenticatedRouter.use("/exercises", exercise);
authenticatedRouter.use("/routes", route);
authenticatedRouter.use("/groups", group);
authenticatedRouter.use("/admin", adminRouter);

baseRouter.use("/public", publicRouter);
baseRouter.use("/auth", authenticatedRouter);

export default baseRouter;
