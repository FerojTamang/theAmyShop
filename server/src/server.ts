import { app } from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.PORT, () => {
  console.log(
    `The AMY Shop API is running on port ${config.PORT} in ${config.NODE_ENV} mode`,
  );
});

const shutdown = (reason: string, error?: unknown): void => {
  if (error) {
    console.error(reason, error);
  } else {
    console.error(reason);
  }

  server.close(() => {
    process.exit(1);
  });
};

process.on("unhandledRejection", (reason) => {
  shutdown("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (error) => {
  shutdown("Uncaught exception", error);
});
