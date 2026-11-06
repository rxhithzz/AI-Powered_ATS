import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import { ConflictError, NotFoundError, UnauthorizedError } from "../lib/errors";
import { LoginInput, RegisterInput } from "../validations/auth.validation";
import { AuthUserPayload } from "../types";

export class AuthService {
  async register(input: RegisterInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError("A user with this email address already exists");
    }

    // Hash the password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT access token with 1 day expiry and role in payload
    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user,
    };
  }

  async login(input: LoginInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Fetch user with passwordHash
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare provided password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT access token with 1 day expiry and role in payload
    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User account not found");
    }

    return user;
  }
}

export const authService = new AuthService();
