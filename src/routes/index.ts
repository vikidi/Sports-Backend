export {}; // This is to combat the TS2451 error

import express from "express";

import user from "./user";
import connection from "./connection";
import exercise from "./exercise";
import route from "./route";
import group from "./group";

const baseRouter = express.Router();
const publicRouter = express.Router();
const authenticatedRouter = express.Router();

publicRouter.use("/connections", connection);

authenticatedRouter.use("/users", user);
authenticatedRouter.use("/exercises", exercise);
authenticatedRouter.use("/routes", route);
authenticatedRouter.use("/groups", group);

baseRouter.use("/public", publicRouter);
baseRouter.use("/auth", authenticatedRouter);

export default baseRouter;
