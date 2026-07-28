import type { NextFunction, Request, Response } from 'express';
import { isProduction } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Journalise cote serveur dans tous les environnements ; seul le detail envoye
  // au client varie, pour ne jamais exposer de stack trace en production.
  console.error(err);

  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
