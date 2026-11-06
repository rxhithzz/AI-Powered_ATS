import { Router } from "express";
import {
  getMeController,
  loginController,
  registerController,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

// POST /auth/register
router.post("/register", validateBody(registerSchema), registerController);

// POST /auth/login
router.post("/login", validateBody(loginSchema), loginController);

// GET /auth/me
router.get("/me", requireAuth, getMeController);

export default router;

