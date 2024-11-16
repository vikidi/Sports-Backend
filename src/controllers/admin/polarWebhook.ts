import { activateWebhook, deactivateWebhook } from "./../../services/polarApi";
import { Request, Response, NextFunction } from "express";
import { AppError, HttpCode } from "../../exceptions/AppError";
import {
  createPolarWebhookConnection,
  deletePolarWebhookConnection,
  getPolarWebhookConnection,
  updatePolarWebhookConnection,
} from "../../services/polar-webhook";

export const createWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const newConnection = await createPolarWebhookConnection();
  res.status(HttpCode.CREATED).json(newConnection);
};

export const getWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const polarWebhook = await getPolarWebhookConnection();
  res.json(polarWebhook);
};

export const activateWebhookConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const axiosResponse = await activateWebhook();

  if (axiosResponse.status === 200) {
    res.json();
  } else if (axiosResponse.status === 204) {
    res.status(HttpCode.NOT_FOUND).json();
  } else {
    return next(
      new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Unable to activate Polar webhook.",
      })
    );
  }
};

export const deactivateWebhookConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const axiosResponse = await deactivateWebhook();

  if (axiosResponse?.status === 200) {
    res.json();
  } else if (axiosResponse?.status === 204) {
    res.status(HttpCode.NOT_FOUND).json();
  } else {
    return next(
      new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Unable to deactivate Polar webhook.",
      })
    );
  }
};

export const updateWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const updatedConnection = await updatePolarWebhookConnection();
  res.status(HttpCode.OK).json(updatedConnection);
};

export const deleteWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  await deletePolarWebhookConnection();
  res.status(HttpCode.NO_CONTENT).json();
};
