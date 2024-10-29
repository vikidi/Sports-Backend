export {}; // This is to combat the TS2451 error

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError, HttpCode } from "../exceptions/AppError";

export const roundTo = (n: number, digits: number) => {
  let negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  let multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = Math.round(n) / multiplicator;
  if (negative) {
    n = n * -1;
  }
  return n.toFixed(digits);
};

export const validRequest = (
  req: Request,
  res: Response,
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

export const getPolarAuthorization = () => {
  return Buffer.from(
    `${process.env.POLAR_CLIENT_ID}:${process.env.POLAR_CLIENT_SECRET}`
  ).toString("base64");
};

export const unless = (
  path: string,
  middleware: (req: Request, res: Response, next: NextFunction) => void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

export function removeItemOnce<T>(arr: Array<T>, value: T): Array<T> {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeItemAll<T>(arr: Array<T>, value: T): Array<T> {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
