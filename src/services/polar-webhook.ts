export {}; // This is to combat the TS2451 error

import { Request } from "express";
import Connection, { ConnectionDocument } from "../models/connection";
import { calculateHmac } from "../utils/signatures";
import {
  deleteWebhook,
  fetchWebhook,
  updateWebhookUrl,
  requestWebhook,
} from "./polarApi";
import { AppError, HttpCode } from "../exceptions/AppError";
import {
  AxiosPolarWebhookConnection,
  PolarWebhookConnection,
} from "../common/types";
import { AxiosResponse } from "axios";

export const createPolarWebhookConnection =
  async (): Promise<PolarWebhookConnection> => {
    const connectionPolar = (await fetchWebhook()).data.data;

    if (!Array.isArray(connectionPolar) || connectionPolar.length !== 0) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description:
          "Polar webhook connection already exists in Polar's system.",
      });
    }

    await Connection.findByIdAndDelete("polar-webhook");

    const newConnection = (await requestWebhook()).data.data;

    const polarWebhook = (
      await Connection.create({
        _id: "polar-webhook",
        externalId: newConnection.id,
        events: newConnection.events,
        url: newConnection.url,
        signatureSecretKey: newConnection.signature_secret_key,
      })
    ).toObject();

    return {
      local: { ...polarWebhook },
      remote: {
        id: newConnection.id,
        events: newConnection.events,
        url: newConnection.url,
        active: true,
      },
    };
  };

/**
 * Retrieves the Polar webhook connection from both the local database and the
 * Polar API and returns both. If the connection does not exist in the local
 * database, it throws an error.
 *
 * @throws {AppError} If the connection does not exist in the local database.
 *
 * @returns {Promise<PolarWebhookConnection>} The webhook connection with remote
 * and local data.
 */
export const getPolarWebhookConnection =
  async (): Promise<PolarWebhookConnection | null> => {
    let localConnection: ConnectionDocument | null = null;
    try {
      localConnection = await Connection.findById("polar-webhook");
    } catch {
      /* Do nothing */
    }

    const remoteConnection: AxiosResponse<AxiosPolarWebhookConnection> =
      await fetchWebhook();

    return {
      local: localConnection,
      remote: remoteConnection?.data?.data[0] ?? null,
    };
  };

export const updatePolarWebhookConnection =
  async (): Promise<PolarWebhookConnection> => {
    const [connectionPolar, connectionDb] = await Promise.all([
      fetchWebhook(),
      Connection.findById("polar-webhook").lean(),
    ]);

    const polarConnectionData = connectionPolar.data.data;

    if (
      polarConnectionData[0]?.url ===
        `${process.env.API_URL}/api/public/connections/polar-webhook` &&
      connectionDb?.url ===
        `${process.env.API_URL}/api/public/connections/polar-webhook`
    ) {
      return {
        local: { ...connectionDb },
        remote: {
          id: polarConnectionData[0].id,
          events: polarConnectionData[0].events,
          url: polarConnectionData[0].url,
          active: polarConnectionData[0].active,
        },
      };
    }

    const patchedConnectionPolar = (
      await updateWebhookUrl(polarConnectionData[0].id)
    ).data.data;

    const patchedConnectionDb = await Connection.findByIdAndUpdate(
      "polar-webhook",
      {
        events: patchedConnectionPolar.events,
        url: patchedConnectionPolar.url,
      },
      { returnDocument: "after", lean: true }
    );

    if (!patchedConnectionDb) {
      throw new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Failed to update webhook connection.",
      });
    }

    return {
      local: { ...patchedConnectionDb },
      remote: {
        id: patchedConnectionPolar[0].id,
        events: patchedConnectionPolar[0].events,
        url: patchedConnectionPolar[0].url,
        active: patchedConnectionPolar[0].active,
      },
    };
  };

/**
 * Deletes the Polar webhook connection from both the local database and
 * the Polar API.
 *
 * @throws {AppError} If the deletion process fails.
 */
export const deletePolarWebhookConnection = async (): Promise<void> => {
  const webhook = await Connection.findById("polar-webhook");

  if (!webhook) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Polar webhook not found from database.",
    });
  }

  await deleteWebhook(webhook.externalId);
  await Connection.findById("polar-webhook");
};

/**
 * Validates the request signature sent by Polar in the request headers.
 * @param {Request} request The express request object.
 * @returns {Promise<boolean>} True if the signature is valid, false otherwise.
 */
export const validateRequestSignature = async (
  request: Request
): Promise<boolean> => {
  const signatureHeader = request.header("Polar-Webhook-Signature");
  const connection = await Connection.findById("polar-webhook");

  if (!signatureHeader || !connection?.signatureSecretKey) {
    return false;
  }

  return (
    signatureHeader ===
    calculateHmac(request.body, connection.signatureSecretKey)
  );
};
