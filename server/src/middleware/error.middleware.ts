import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/errors";
import { env } from "../lib/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }

  // 2. Custom App Errors (AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. unique email)
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(", ")
        : (err.meta?.target as string) || "field";

      res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists.`,
      });
      return;
    }

    // Record to update or delete does not exist
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "The requested database record was not found.",
      });
      return;
    }
  }

  // 4. Default / Unhandled Server Errors
  console.error("💥 Unhandled Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" ? { error: err.message, stack: err.stack } : {}),
  });
};

