import { Router, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createUser, deleteUser, findUserByEmail, findUserById } from '../db/users.js';
import { hashPassword, signToken, verifyPassword } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validation/auth.schema.js';
import { AUTH_COOKIE_NAME, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { isProduction } from '../config/env.js';

export const authRouter = Router();

// Limite les tentatives sur les routes sensibles pour freiner le bruteforce.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Donnees invalides');
    }

    const { email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new AppError(409, 'Un compte existe deja avec cet email');
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);
    const token = signToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({ id: user.id, email: user.email });
  }),
);

authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Donnees invalides');
    }

    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      throw new AppError(401, 'Email ou mot de passe incorrect');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Email ou mot de passe incorrect');
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    res.json({ id: user.id, email: user.email });
  }),
);

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(204).send();
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.userId!);
    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable');
    }
    res.json({ id: user.id, email: user.email });
  }),
);

// Droit a l'oubli RGPD : suppression definitive du compte et de ses donnees
// (jobs et executions supprimes en cascade au niveau de la base).
authRouter.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    await deleteUser(req.userId!);
    res.clearCookie(AUTH_COOKIE_NAME);
    res.status(204).send();
  }),
);
