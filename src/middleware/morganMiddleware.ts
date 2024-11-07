import morgan from "morgan";
import logger from "../services/logger";

const logFormat = `
{
    "httpMethod": ":method",
    "requestUrl": ":url",
    "responseStatus": ":status",
    "responseTime": ":response-time ms",
    "contentLength": ":res[content-length]",
    "httpVersion": "HTTP/:http-version",
    "remoteAddress": ":remote-addr"
}`;

/**
 * Handles log messages by parsing the message and logging it with additional information.
 *
 * @param message - The raw log message string to be processed and logged.
 */
function logMessageHandler(message: any) {
  logger.info("HTTP request received", JSON.parse(message.trim()));
}

const loggingMiddleware = morgan(logFormat, {
  stream: { write: logMessageHandler },
});

export default loggingMiddleware;
