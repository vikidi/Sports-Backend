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

function logMessageHandler(message: any) {
  logger.info("HTTP request received", JSON.parse(message.trim()));
}

const loggingMiddleware = morgan(logFormat, {
  stream: { write: logMessageHandler },
});

export default loggingMiddleware;
