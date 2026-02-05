import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { globalErrorHandler } from "./app/middlewares";
import { ApiError } from "./app/utils";

const app = express();
const server = http.createServer(app);
const port = 5000;

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

// 5. Start Server
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
