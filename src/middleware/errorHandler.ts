import { Request, Response, NextFunction } from "express";
import { AppError, HttpCode } from "../exceptions/AppError";
import { UnauthorizedError } from "express-oauth2-jwt-bearer";
import logger from "../services/logger";

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
    req: Request,
    res: Response
  ): void => {
    res
      .status(HttpCode.UNAUTHORIZED)
      .json({ name: error.name, message: error.message });

    logger.warn("Unauthorized attempt", {
      user: req.user?.id,
      path: req.path,
      name: error.name,
      message: error.message,
    });
  };

  private readonly handleTrustedError = (
    error: AppError,
    req: Request,
    res: Response
  ): void => {
    res
      .status(error.httpCode)
      .json({ name: error.name, message: error.message });

    logger.error("Application error", {
      user: req.user?.id,
      path: req.path,
      name: error.name,
      message: error.message,
    });
  };

  private readonly handleCriticalError = (
    error: Error | AppError,
    req: Request,
    res?: Response
  ): void => {
    if (res) {
      res
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    logger.crit("Application encountered a critical error.", {
      user: req.user?.id,
      path: req.path,
      name: error.name,
      message: error.message,
    });
  };

  public handleError = (
    error: Error | AppError | UnauthorizedError,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (this.isAuthError(error) && res) {
      this.handleAuthError(error as UnauthorizedError, req, res);
    } else if (this.isTrustedAppError(error) && req) {
      this.handleTrustedError(error as AppError, req, res);
    } else {
      this.handleCriticalError(error, req, res);
    }
  };
}

export const errorHandler = new ErrorHandler();
