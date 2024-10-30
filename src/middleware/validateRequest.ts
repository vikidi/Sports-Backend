import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError, HttpCode } from "../exceptions/AppError";

export const validRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: errors.array().join(", "),
    });
  }

  next();
};
