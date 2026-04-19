import pino from "pino";

// In Development nutzen wir hübsches, lesbares Format. 
// In Production geben wir reines JSON aus (besser für Datadog, CloudWatch etc.).
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: {
    env: process.env.NODE_ENV,
    app: "schachverein",
  },
});
