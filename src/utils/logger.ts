import pino from "pino";
export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty", // Makes logs readable in development
    options: { colorize: true },
  },
});
