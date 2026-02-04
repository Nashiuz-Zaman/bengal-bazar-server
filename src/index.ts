import express, { Request, Response, NextFunction } from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const port = 3000;

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
  const err = new Error(`${req.url} not found`) as any;
  err.status = 404;
  next(err);
});


// 4. Simple Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 5. Start Server
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;