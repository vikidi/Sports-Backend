import { Request, Response, NextFunction } from "express";
import { AppError, HttpCode } from "../exceptions/AppError";
import { UnauthorizedError } from "express-oauth2-jwt-bearer";

class ErrorHandler {
  private readonly isTrustedAppError = (error: Error): boolean => {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  };

  private readonly isAuthError = (error: Error): boolean => {
    if (error instanceof UnauthorizedError) {
      return true;
    }

    return false;
  };

  private readonly handleAuthError = (
    error: UnauthorizedError,
    response: Response
  ): void => {
    response
      .status(HttpCode.UNAUTHORIZED)
      .json({ name: error.name, message: error.message });
  };

  private readonly handleTrustedError = (
    error: AppError,
    response: Response
  ): void => {
    response
      .status(error.httpCode)
      .json({ name: error.name, message: error.message });
  };

  private readonly handleCriticalError = (
    error: Error | AppError,
    response?: Response
  ): void => {
    if (response) {
      response
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    console.log("Application encountered a critical error.");
    console.log(error.message);
  };

  public handleError = (
    error: Error | AppError | UnauthorizedError,
    _req: Request,
    response: Response,
    _next: NextFunction
  ): void => {
    if (this.isAuthError(error) && response) {
      this.handleAuthError(error as UnauthorizedError, response);
    } else if (this.isTrustedAppError(error) && response) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  };
}

export const errorHandler = new ErrorHandler();
