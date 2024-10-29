export {}; // This is to combat the TS2451 error

import axios from "axios";
import { Request, Response } from "express";
import User from "../models/user";

const { getPolarAuthorization } = require("../utils");

const getSelf = (req: Request, res: Response) => {
  User.findById(req.user!.id)
    .then((user) => {
      if (user === null)
        return res.status(404).json({ errors: ["User not found."] });

      res.json({
        polarConnected: user.polarToken !== undefined,
      });
    })
    .catch((err) =>
      res.status(err.status ?? 500).json({ errors: [err.message] })
    );
};

const create = (req: Request, res: Response) => {
  User.findById(req.user!.id)
    .then((user) => {
      if (user !== null) return;

      return User.create({
        _id: req.user!.id,
      });
    })
    .then(() => res.status(200).json())
    .catch((err) =>
      res.status(err.status ?? 500).json({ errors: [err.message] })
    );
};

const polarToken = (req: Request, res: Response) => {
  if (!req.user) return res.status(401);

  axios
    .post(
      "https://polarremote.com/v2/oauth2/token",
      { grant_type: "authorization_code", code: req.body.code },
      {
        headers: {
          Authorization: `Basic ${getPolarAuthorization()}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json;charset=UTF-8",
        },
      }
    )
    .then((result) => {
      let t = new Date();
      t.setSeconds(t.getSeconds() + result.data.expires_in);

      return User.findByIdAndUpdate(
        req.user!.id,
        {
          polarId: result.data.x_user_id,
          polarToken: result.data.access_token,
          polarTokenCreatedAt: Date.now(),
          polarTokenExpiresAt: t,
        },
        { returnDocument: "after" }
      );
    })
    .then((user) => {
      // TODO: What if user is null

      return axios.post(
        "https://www.polaraccesslink.com/v3/users",
        { "member-id": `${user!.polarId}` }, // TODO: What if user is null
        {
          headers: {
            Authorization: `Bearer ${user!.polarToken}`, // TODO: What if user is null
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    })
    .then((resp) => {
      return User.findByIdAndUpdate(req.user!.id, {
        polarMemberId: resp.data["member-id"],
      });
    })
    .then(() => res.status(200).json())
    .catch((err) => {
      return res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

module.exports = {
  getSelf,
  create,
  polarToken,
};
