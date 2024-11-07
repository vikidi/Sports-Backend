import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError, HttpCode } from "../exceptions/AppError";

/**
 * Express middleware that checks if the request is valid according to the
 * validation rules defined using express-validator.
 *
 * If the request is invalid, it throws an AppError with HTTP code 400 and a
 * description that contains all the validation error messages joined by a
 * comma.
 *
 * @param {Request} req The express request object.
 * @param {Response} _res The express response object, not used.
 * @param {NextFunction} next The next middleware function in the stack.
 */
export const validRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errorMessages = validationErrors
      .array()
      .map((error) => error.msg)
      .join(", ");
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: errorMessages,
    });
  }

  next();
};
