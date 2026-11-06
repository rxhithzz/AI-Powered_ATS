import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/error.middleware";
import { NotFoundError } from "./lib/errors";
import { registerRoutes } from "./routes";

const app: Application = express();

// Global Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : [env.CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// Mount routes at both root prefix and /api prefix for complete flexibility
// e.g., /auth/login AND /api/auth/login both work!
registerRoutes(app);

const apiRouter = express.Router();
registerRoutes(apiRouter);
app.use("/api", apiRouter);

// Catch-all 404 handler for unmatched endpoints
app.use((req: Request, res: Response) => {
  throw new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} does not exist`);
});

// Central Error Handler
app.use(errorHandler);

export default app;

