import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// In Node.js, the listen() callback fires on the 'listening' event and NEVER
// receives an error argument — port-in-use / bind failures are emitted as
// 'error' events on the server object. Attaching a listener for that event
// prevents Node's uncaughtException default (which logs nothing useful) and
// ensures startup failures are captured in the Pino log before process exit.
const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Failed to bind server — exiting");
  process.exit(1);
});
