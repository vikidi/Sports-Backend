export {}; // This is to combat the TS2451 error

import { connect, connection } from "mongoose";
import { checkPolarApiConnection } from "../services/polar-webhook";

/**
 * Initializes the MongoDB connection and verifies the Polar API connection.
 * Should be called once during application startup.
 */
export const initDatabase = (): void => {
  if (process.env.NODE_ENV !== "test") {
    connect(getMongoDbUri())
      .then(checkPolarApiConnection)
      .catch(handleConnectionError);

    connection.on("error", handleConnectionError);
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
  console.error("Database connection error:", error);
};
