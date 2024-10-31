export {}; // This is to combat the TS2451 error

import axios from "axios";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { createNew } from "../utils/exercise";
import { HttpCode } from "../exceptions/AppError";

export const polarWebhook = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (req.body.event !== "EXERCISE") {
    res.status(HttpCode.NO_CONTENT).json();
    return;
  }

  const user = await User.findOne({ polarId: req.body["user_id"] });

  const response = await axios.get(`${req.body.url}/tcx`, {
    headers: {
      Accept: "application/vnd.garmin.tcx+xml",
      Authorization: `Bearer ${user!.polarToken}`,
    },
  });

  await createNew(req.user!.id, Buffer.from(response.data, "utf8"));

  res.status(HttpCode.NO_CONTENT).json();
};
