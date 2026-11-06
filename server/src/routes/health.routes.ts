import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

const router = Router();

// GET /health
router.get("/", async (req: Request, res: Response) => {
  let dbStatus = "connected";
  try {
    // Quick query to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "disconnected";
  }

  const statusCode = dbStatus === "connected" ? 200 : 503;

  res.status(statusCode).json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
    environment: env.NODE_ENV,
  });
});

export default router;

