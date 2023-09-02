const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: __dirname + "/./../.env.development.local",
  });
}

const BaseRouter = require("./routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "15mb" }));

require("./database");

app.use(
  auth({
    audience: process.env.AUTH_AUDIENCE,
    issuerBaseURL: process.env.AUTH_ISSUER,
    tokenSigningAlg: "RS256",
  })
);

app.use((req, res, next) => {
  req.user = { id: req.auth.payload.sub };
  next();
});

app.use("/", BaseRouter);

module.exports = app;
