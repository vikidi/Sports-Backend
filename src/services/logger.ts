import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    serviceName: "express-logging-service",
    buildDetails: {
      nodeVersion: process.version,
      commitHash: process.env.COMMIT_HASH || "local",
      appVersion: process.env.VERSION || "1.0.0",
    },
  },
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      ({
        message,
        timestamp,
        level,
        serviceName,
        buildDetails,
        stack,
        ...meta
      }) => {
        // Ignore serviceName and buildDetails when logging to the console
        return `${timestamp} ${level}: ${message} ${JSON.stringify(meta)}${
          stack ? "\n" + stack : ""
        }`;
      }
    )
  ),
});

const combinedFileTransport = new DailyRotateFile({
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "7d",
  filename: `${
    process.env.LOG_FOLDER ?? __dirname + "/../../logs"
  }/combined-%DATE%.log`,
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const errorFileTransport = new DailyRotateFile({
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "7d",
  filename: `${
    process.env.LOG_FOLDER ?? __dirname + "/../../logs"
  }/error-%DATE%.log`,
  level: "error",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
});

if (process.env.NODE_ENV === "development") {
  logger.add(consoleTransport);
}

if (process.env.NODE_ENV === "production") {
  logger.add(combinedFileTransport);
  logger.add(errorFileTransport);
}

export default logger;
