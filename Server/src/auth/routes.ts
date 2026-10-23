import { eq } from "drizzle-orm";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import { signAccessToken } from "./jwt.js";
import { requireAuth } from "./middleware.js";
import { generateSalt, hashPassword, verifyPassword } from "./password.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.email().max(255),
  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(72),
});

function publicUser(user: { id: string; email: string; username: string }) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

function isDatabaseConfigError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes("DATABASE_URL");
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;

  while (typeof current === "object" && current !== null) {
    if ("code" in current && (current as { code?: string }).code === "23505") {
      return true;
    }

    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }

  return false;
}

authRouter.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid registration data", details: parsed.error.flatten() });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const { username, password } = parsed.data;
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  try {
    const [user] = await getDb()
      .insert(users)
      .values({ email, username, salt, passwordHash })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });

    if (!user) {
      res.status(500).json({ error: "Failed to create user" });
      return;
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Email or username is already taken" });
      return;
    }

    if (isDatabaseConfigError(error)) {
      res.status(503).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Unable to register" });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login data", details: parsed.error.flatten() });
    return;
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.salt, user.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    if (isDatabaseConfigError(error)) {
      res.status(503).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Unable to log in" });
  }
});

authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});
