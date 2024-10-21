import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  auth: {
    payload: {
      sub: string;
    };
  };
  user: {
    id: string;
  };
}
