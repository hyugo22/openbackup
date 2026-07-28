import { Router } from 'express';
import { createJob, deleteJob, getJobById, listJobsByUser, updateJob } from '../db/jobs.js';
import { listExecutionsByJob } from '../db/executions.js';
import { createJobSchema, updateJobSchema } from '../validation/jobs.schema.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const jobsRouter = Router();

jobsRouter.use(requireAuth);

jobsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const jobs = await listJobsByUser(req.userId!);
    res.json(jobs);
  }),
);

jobsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Donnees invalides');
    }

    const { name, sourcePath, destinationPath } = parsed.data;
    const job = await createJob(req.userId!, name, sourcePath, destinationPath);
    res.status(201).json(job);
  }),
);

jobsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new AppError(400, 'Identifiant de job invalide');
    }

    const job = await getJobById(id, req.userId!);
    if (!job) {
      throw new AppError(404, 'Job introuvable');
    }
    res.json(job);
  }),
);

jobsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new AppError(400, 'Identifiant de job invalide');
    }

    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Donnees invalides');
    }

    const { name, sourcePath, destinationPath } = parsed.data;
    const job = await updateJob(id, req.userId!, name, sourcePath, destinationPath);
    if (!job) {
      throw new AppError(404, 'Job introuvable');
    }
    res.json(job);
  }),
);

jobsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new AppError(400, 'Identifiant de job invalide');
    }

    const deleted = await deleteJob(id, req.userId!);
    if (!deleted) {
      throw new AppError(404, 'Job introuvable');
    }
    res.status(204).send();
  }),
);

// Historique des executions d'un job. Le declenchement reel des backups
// (planification, execution effective) est prevu pour une session future ;
// cette route expose deja le modele de donnees pret a etre alimente.
jobsRouter.get(
  '/:id/executions',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new AppError(400, 'Identifiant de job invalide');
    }

    const job = await getJobById(id, req.userId!);
    if (!job) {
      throw new AppError(404, 'Job introuvable');
    }

    const executions = await listExecutionsByJob(id);
    res.json(executions);
  }),
);
