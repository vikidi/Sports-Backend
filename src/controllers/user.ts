export {}; // This is to combat the TS2451 error

import axios from "axios";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { AppError, HttpCode } from "../exceptions/AppError";
import { getPolarAuthorization } from "../utils/polar";

export const getSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user!.id);

  if (!user) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "User not found.",
      })
    );
  }

  res.json({ polarConnected: user.polarToken !== undefined });
};

export const create = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const user = User.findById(req.user!.id);

  if (user !== null) {
    res.status(HttpCode.NO_CONTENT).json();
    return;
  }

  const createdUser = await User.create({ _id: req.user!.id });

  res.json(createdUser);
};

export const polarToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const result = await axios.post(
    "https://polarremote.com/v2/oauth2/token",
    { grant_type: "authorization_code", code: req.body.code },
    {
      headers: {
        Authorization: `Basic ${getPolarAuthorization()}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json;charset=UTF-8",
      },
    }
  );

  let t = new Date();
  t.setSeconds(t.getSeconds() + result.data.expires_in);

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      polarId: result.data.x_user_id,
      polarToken: result.data.access_token,
      polarTokenCreatedAt: Date.now(),
      polarTokenExpiresAt: t,
    },
    { returnDocument: "after" }
  );

  // TODO: What if user is null

  const resp = await axios.post(
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

  await User.findByIdAndUpdate(req.user!.id, {
    polarMemberId: resp.data["member-id"],
  });

  res.json();
};
