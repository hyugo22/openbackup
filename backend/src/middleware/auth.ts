import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/auth.service.js';

export const AUTH_COOKIE_NAME = 'token';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Authentification requise' });
    return;
  }

  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Session invalide ou expiree' });
  }
}
