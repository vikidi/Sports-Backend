import http from "http";
import app from "./app";

const serverListenPort = normalizePort(process.env.PORT || "5050");
app.set("port", serverListenPort);
const server = http.createServer(app);
server.listen(serverListenPort, () => {
  console.log("App running in port " + serverListenPort);
});

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
