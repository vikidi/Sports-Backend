const axios = require("axios");
const { validationResult } = require("express-validator");

const validRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const getPolarAuthorization = () => {
  return Buffer.from(
    `${process.env.POLAR_CLIENT_ID}:${process.env.POLAR_CLIENT_SECRET}`
  ).toString("base64");
};

const unless = function (path, middleware) {
  return function (req, res, next) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

module.exports = {
  validRequest,
  getPolarAuthorization,
  unless,
};
