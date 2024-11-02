export {}; // This is to combat the TS2451 error

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { auth } from "express-oauth2-jwt-bearer";
import { errorHandler } from "./middleware/errorHandler";
import BaseRouter from "./routes";
import { initDatabase } from "./database";
import morganMiddleware from "./middleware/morganMiddleware";

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "15mb" }));

app.use(morganMiddleware);

app.use(
  "/api/auth",
  auth({
    audience: process.env.AUTH_AUDIENCE,
    issuerBaseURL: process.env.AUTH_ISSUER,
    tokenSigningAlg: "RS256",
  })
);

app.use("/api/auth", (req, _, next) => {
  req.user = { id: req.auth!.payload.sub };
  next();
});

app.use("/api", BaseRouter);

// Setup database and polar API connection
initDatabase();

app.use(errorHandler.handleError);

export default app;
