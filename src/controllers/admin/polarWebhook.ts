import { Request, Response, NextFunction } from "express";
import Connection from "../../models/connection";

export const get = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const polarWebhook = await Connection.findById("polar-webhook");

  res.json(polarWebhook);
};
