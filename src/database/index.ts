export {}; // This is to combat the TS2451 error

import { connect, connection } from "mongoose";
import logger from "../services/logger";
import Connection from "../models/connection";

/**
 * Initializes the MongoDB connection.
 * Should be called once during application startup.
 */
export const initDatabase = (): void => {
  if (process.env.NODE_ENV !== "test") {
    connect(getMongoDbUri())
      .then(() => updateLocalWebhookData())
      .catch(handleConnectionError);

    connection.on("error", handleConnectionError);
  }
};

const updateLocalWebhookData = async (): Promise<void> => {
  const webhook = await Connection.findById("polar-webhook");

  if (!webhook) return;

  if (
    webhook.url !==
    `${process.env.API_URL}/api/public/connections/polar-webhook`
  ) {
    webhook.url = `${process.env.API_URL}/api/public/connections/polar-webhook`;
    await webhook.save();
  }
};

/**
 * Constructs the MongoDB URI from environment variables.
 * @returns {string} The MongoDB connection URI.
 */
const getMongoDbUri = (): string => {
  const {
    MONGODB_PREFIX,
    MONGODB_USER,
    MONGODB_PASS,
    MONGODB_URL,
    MONGODB_DB,
  } = process.env;
  return `${MONGODB_PREFIX}://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;
};

/**
 * Handles errors during MongoDB connection.
 * @param {Error} error The error object.
 */
const handleConnectionError = (error: Error): void => {
  logger.error("Database connection error:", error);
};
