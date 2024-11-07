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

export const checkPolarApiConnection = async () => {
  const connectionPolar = (await fetchWebhook()).data.data;
  const connectionDb = await Connection.findById("polar-webhook");

  // Connection not found from polar API
  if (Array.isArray(connectionPolar) && !connectionPolar.length) {
    // Delete connection if found from DB
    if (connectionDb) {
      await Connection.deleteOne({ _id: "polar-webhook" });
    }

    // Request new connection from polar API
    const newConnection = (await requestWebhook()).data.data;

    // Add the new connection to DB
    await Connection.create({
      _id: "polar-webhook",
      externalId: newConnection.id,
      events: newConnection.events,
      url: newConnection.url,
      signatureSecretKey: newConnection.signature_secret_key,
    });
  }

  // Connection found from polar API
  else {
    // No updating needed
    if (
      connectionPolar[0]?.url ===
        `${process.env.API_URL}/api/public/connections/polar-webhook` &&
      connectionDb?.url ===
        `${process.env.API_URL}/api/public/connections/polar-webhook` &&
      connectionDb?.signatureSecretKey !== null
    ) {
      return;
    }

    // Create new connection to Polar and DB if connection or signature key are not found from DB
    // This is to get new signature secret, which is only received while creating new connection
    if (!connectionDb?.signatureSecretKey) {
      // Delete old connection from Polar
      await deleteWebhook(connectionPolar[0].id);

      // Request new connection from Polar API
      const newConnection = (await requestWebhook()).data.data;

      // Add the new connection to DB
      await Connection.create({
        _id: "polar-webhook",
        externalId: newConnection.id,
        events: newConnection.events,
        url: newConnection.url,
        signatureSecretKey: newConnection.signature_secret_key,
      });
    }

    // Update connection in Polar and DB
    else {
      const patchedConnection = (await updateWebhookUrl(connectionPolar[0].id))
        .data.data;

      await Connection.findByIdAndUpdate("polar-webhook", {
        events: patchedConnection.events,
        url: patchedConnection.url,
      });
    }
  }
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
