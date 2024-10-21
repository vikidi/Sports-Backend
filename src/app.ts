export {}; // This is to combat the TS2451 error

import express, { Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { auth } from "express-oauth2-jwt-bearer";

import { unless } from "./utils";

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
  unless("/connections/polar-webhook", (req, _, next) => {
    req.user = { id: req.auth!.payload.sub };
    next();
  })
);

if (process.env.NODE_ENV !== "test") {
  require("./services/polar-webhook");
}

app.use("/", BaseRouter);

export default app;
