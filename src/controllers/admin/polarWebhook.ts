import {
  activateWebhook,
  deactivateWebhook,
  fetchWebhook,
} from "./../../services/polarApi";
import { Request, Response, NextFunction } from "express";
import Connection from "../../models/connection";
import { AppError, HttpCode } from "../../exceptions/AppError";

export const createWebhookConnection = () => {};

export const getWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const [polarWebhook, remoteWebhookResponse] = await Promise.all([
    Connection.findById("polar-webhook").lean(),
    fetchWebhook(),
  ]);

  const remoteWebhook = remoteWebhookResponse.data.data;

  res.json({
    ...polarWebhook,
    remoteId: remoteWebhook[0].id,
    remoteEvents: remoteWebhook[0].events,
    remoteUrl: remoteWebhook[0].url,
    active: remoteWebhook[0].active,
  });
};

export const activateWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const axiosResponse = await activateWebhook();

  if (axiosResponse.status === 200) {
    res.json();
    return;
  } else if (axiosResponse.status === 204) {
    res.status(HttpCode.NOT_FOUND).json();
    return;
  } else {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: "Unable to activate Polar webhook.",
    });
  }
};

export const deactivateWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const axiosResponse = await deactivateWebhook();

  if (axiosResponse?.status === 200) {
    res.json();
    return;
  } else if (axiosResponse?.status === 204) {
    res.status(HttpCode.NOT_FOUND).json();
    return;
  } else {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: "Unable to deactivate Polar webhook.",
    });
  }
};

export const updateWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {};

export const deleteWebhookConnection = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {};
