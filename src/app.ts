export {}; // This is to combat the TS2451 error

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./common/types";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const { unless } = require("./utils");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: __dirname + "/./../.env.development.local",
  });
}

const BaseRouter = require("./routes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

app.use(helmet());
app.use(cors());

app.use(fileUpload());
app.use(express.json({ limit: "15mb" }));

// Tests will handle database separately
if (process.env.NODE_ENV !== "test") {
  require("./database");
}

app.use(
  unless(
    "/connections/polar-webhook",
    auth({
      audience: process.env.AUTH_AUDIENCE,
      issuerBaseURL: process.env.AUTH_ISSUER,
      tokenSigningAlg: "RS256",
    })
  )
);

app.use(
  unless(
    "/connections/polar-webhook",
    (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
      req.user = { id: req.auth.payload.sub };
      next();
    }
  )
);

if (process.env.NODE_ENV !== "test") {
  require("./services/polar-webhook");
}

app.use("/", BaseRouter);

module.exports = app;
