import { pool } from './pool.js';
import type { BackupJob } from '../types/index.js';

interface BackupJobRow {
  id: number;
  user_id: number;
  name: string;
  source_path: string;
  destination_path: string;
  created_at: string;
  updated_at: string;
}

function toJob(row: BackupJobRow): BackupJob {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sourcePath: row.source_path,
    destinationPath: row.destination_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createJob(
  userId: number,
  name: string,
  sourcePath: string,
  destinationPath: string,
): Promise<BackupJob> {
  const result = await pool.query<BackupJobRow>(
    `INSERT INTO backup_jobs (user_id, name, source_path, destination_path)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, name, source_path, destination_path, created_at, updated_at`,
    [userId, name, sourcePath, destinationPath],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Echec de la creation du job');
  return toJob(row);
}

export async function listJobsByUser(userId: number): Promise<BackupJob[]> {
  const result = await pool.query<BackupJobRow>(
    `SELECT id, user_id, name, source_path, destination_path, created_at, updated_at
     FROM backup_jobs WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows.map(toJob);
}

export async function getJobById(id: number, userId: number): Promise<BackupJob | null> {
  const result = await pool.query<BackupJobRow>(
    `SELECT id, user_id, name, source_path, destination_path, created_at, updated_at
     FROM backup_jobs WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  const row = result.rows[0];
  return row ? toJob(row) : null;
}

export async function updateJob(
  id: number,
  userId: number,
  name: string,
  sourcePath: string,
  destinationPath: string,
): Promise<BackupJob | null> {
  const result = await pool.query<BackupJobRow>(
    `UPDATE backup_jobs
     SET name = $3, source_path = $4, destination_path = $5, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, name, source_path, destination_path, created_at, updated_at`,
    [id, userId, name, sourcePath, destinationPath],
  );
  const row = result.rows[0];
  return row ? toJob(row) : null;
}

export async function deleteJob(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM backup_jobs WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
