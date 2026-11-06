import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../lib/env";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";
import { AuthUserPayload } from "../types";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is required (Bearer format)");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;

    if (!decoded.userId || !decoded.role) {
      throw new UnauthorizedError("Invalid token payload");
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token has expired. Please sign in again."));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or corrupted authentication token"));
      return;
    }
    next(error);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Requires one of the following roles: [${roles.join(", ")}]. Current role: ${req.user.role}`
      );
    }

    next();
  };
};

