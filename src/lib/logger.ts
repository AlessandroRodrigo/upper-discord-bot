import pino from "pino";

export const logger = pino({
  name: "level-up",
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
