export {}; // This is to combat the TS2451 error

import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { AppError, HttpCode } from "../exceptions/AppError";
import { getUserToken, registerUser } from "../services/polarApi";

export const getSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    return next(
      new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: "User unauthenticated.",
      })
    );
  }

  const user = await User.findById(req.user.id);

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
  next: NextFunction
) => {
  if (!req.user?.id) {
    return next(
      new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: "User unauthenticated.",
      })
    );
  }

  const user = await User.findById(req.user.id);

  if (user !== null) {
    res.status(HttpCode.NO_CONTENT).json();
    return;
  }

  const createdUser = await User.create({ _id: req.user.id });

  res
    .status(HttpCode.CREATED)
    .json({ polarConnected: createdUser.polarToken !== undefined });
};

export const polarToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    return next(
      new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: "User unauthenticated.",
      })
    );
  }

  const result = await getUserToken(req.body.code);

  let t = new Date();
  t.setSeconds(t.getSeconds() + result.data.expires_in);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      polarId: result.data.x_user_id,
      polarToken: result.data.access_token,
      polarTokenCreatedAt: Date.now(),
      polarTokenExpiresAt: t,
    },
    { returnDocument: "after" }
  );

  if (!user) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "User not found.",
      })
    );
  }

  if (!user.polarId || !user.polarToken) {
    return next(
      new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Invalid user.",
      })
    );
  }

  const resp = await registerUser(user.polarId, user.polarToken);

  await User.findByIdAndUpdate(req.user.id, {
    polarMemberId: resp.data["member-id"],
  });

  res.json();
};
