const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const morgan = require("morgan");
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
app.use(express.json({ limit: "15mb" }));

require("./database");

app.use(
  unless(
    "/connection/polar-webhook",
    auth({
      audience: process.env.AUTH_AUDIENCE,
      issuerBaseURL: process.env.AUTH_ISSUER,
      tokenSigningAlg: "RS256",
    })
  )
);

app.use(
  unless("/connection/polar-webhook", (req, res, next) => {
    req.user = { id: req.auth.payload.sub };
    next();
  })
);

require("./services/polar-webhook");

app.use("/", BaseRouter);

module.exports = app;
