export {}; // This is to combat the TS2451 error

import { Request } from "express";
import Connection from "../models/connection";
import { calculateHmac } from "../utils/signatures";
import {
  deleteWebhook,
  fetchWebhook,
  updateWebhookUrl,
  requestWebhook,
} from "./polarApi";
import { AppError, HttpCode } from "../exceptions/AppError";
import { PolarWebhookConnection } from "../common/types";

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
      ...polarWebhook,
      remoteId: newConnection.id,
      remoteEvents: newConnection.events,
      remoteUrl: newConnection.url,
      active: true,
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
  async (): Promise<PolarWebhookConnection> => {
    const [localConnection, remoteConnection] = await Promise.all([
      Connection.findById("polar-webhook").lean(),
      fetchWebhook(),
    ]);

    if (!localConnection) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Polar webhook connection not found.",
      });
    }

    return {
      ...localConnection,
      remoteId: remoteConnection.data.data[0].id,
      remoteEvents: remoteConnection.data.data[0].events,
      remoteUrl: remoteConnection.data.data[0].url,
      active: remoteConnection.data.data[0].active,
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
        ...connectionDb,
        remoteId: polarConnectionData[0].id,
        remoteEvents: polarConnectionData[0].events,
        remoteUrl: polarConnectionData[0].url,
        active: polarConnectionData[0].active,
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
      ...patchedConnectionDb,
      remoteId: patchedConnectionPolar[0].id,
      remoteEvents: patchedConnectionPolar[0].events,
      remoteUrl: patchedConnectionPolar[0].url,
      active: patchedConnectionPolar[0].active,
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
