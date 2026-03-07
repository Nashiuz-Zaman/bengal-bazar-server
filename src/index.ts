import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { ApiError } from "./utils/ApiError.js";
import { prismaInstance } from "./lib/prisma.js";
import { config } from "./config/env.js";

export const clientUrl =
  config.environment !== "production"
    ? "http://localhost:3000"
    : "https://bengalbazar.vercel.app";

const app = express();
const server = http.createServer(app);
const port = process.env.port || 5000;

// 1. Basic Middlewares
app.use(express.json());
app.set("trust proxy", 1);

// 2. Standard Routes
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello World</h1><p>Express 5 Server is running.</p>");
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

// 3. Express 5 Catch-All (Using named wildcard)
app.all("*path", (req: Request, res: Response, next: NextFunction) => {
  throw ApiError.NotFound(`${req.url} not found`);
});

// 4. Simple Global Error Handler
// Global error handler
app.use(globalErrorHandler);

// 5. Connect DB + Start Server
const startServer = async () => {
  try {
    // safety connection
    await prismaInstance.$connect();

    if (process.env.NODE_ENV === "development") {
      server.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  await prismaInstance.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Docker / hosting

export default app;
