export {}; // This is to combat the TS2451 error

import axios from "axios";
import { Request, Response } from "express";
import { User } from "../models/user";

const { createNew } = require("../utils/exercise");

const polarWebhook = (req: Request, res: Response) => {
  if (req.body.event === "PING") {
    return res.sendStatus(200);
  } else if (req.body.event === "EXERCISE") {
    User.findOne({ polarId: req.body["user_id"] })
      .then((user) => {
        return axios.get(`${req.body.url}/tcx`, {
          headers: {
            Accept: "application/vnd.garmin.tcx+xml",
            Authorization: `Bearer ${user!.polarToken}`,
          },
        });
      })
      .then((response) => {
        return createNew(req.user!.id, Buffer.from(response.data, "utf8"));
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.status(err.status ?? 500).json({ errors: [err.message] });
      });
  }
};

module.exports = {
  polarWebhook,
};
