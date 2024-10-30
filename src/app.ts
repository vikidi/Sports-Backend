export {}; // This is to combat the TS2451 error

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { auth } from "express-oauth2-jwt-bearer";
import { unless } from "./utils";
import { errorHandler } from "./middleware/errorHandler";
import BaseRouter from "./routes";
import { initDatabase } from "./database";

const app = express();

console.log(process.env.API_URL);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "15mb" }));

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

app.use("/", BaseRouter);

// Setup database and polar API connection
initDatabase();

app.use(errorHandler.handleError);

export default app;
