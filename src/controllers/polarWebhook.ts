export {}; // This is to combat the TS2451 error

import axios from "axios";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { createNew } from "../utils/exercise";
import { HttpCode } from "../exceptions/AppError";
import { validateRequestSignature } from "../services/polar-webhook";

const schemesList = ["https:"];
const domainsList = ["www.polaraccesslink.com", "polaraccesslink.com"];

export const webhookCall = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (req.body.event === "PING") {
    res.sendStatus(HttpCode.OK);
    return;
  } else if (req.body.event === "EXERCISE") {
    if (!(await validateRequestSignature(req))) {
      console.log("here");
      res.status(HttpCode.BAD_REQUEST).json();
      return;
    }

    const user = await User.findOne({
      polarId: req.body["user_id"].toString(),
    });

    const url = new URL(req.body.url);

    if (
      !schemesList.includes(url.protocol) ||
      !domainsList.includes(url.hostname)
    ) {
      res.status(HttpCode.BAD_REQUEST).json();
      return;
    }

    const response = await axios.get(`${url}/tcx`, {
      headers: {
        Accept: "application/vnd.garmin.tcx+xml",
        Authorization: `Bearer ${user!.polarToken}`,
      },
    });

    await createNew(req.user!.id, Buffer.from(response.data, "utf8"));

    res.status(HttpCode.NO_CONTENT).json();
    return;
  }

  res.status(HttpCode.BAD_REQUEST).json();
};
