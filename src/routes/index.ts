export {}; // This is to combat the TS2451 error

import express from "express";

import user from "./user";
import connection from "./connection";
import exercise from "./exercise";
import route from "./route";
import group from "./group";

const router = express.Router();

router.use("/users", user);
router.use("/connections", connection);
router.use("/exercises", exercise);
router.use("/routes", route);
router.use("/groups", group);

export default router;
