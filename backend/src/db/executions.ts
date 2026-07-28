import { pool } from './pool.js';
import type { BackupExecution } from '../types/index.js';

interface BackupExecutionRow {
  id: number;
  job_id: number;
  status: 'success' | 'failure' | 'running';
  started_at: string;
  finished_at: string | null;
  size_bytes: string | null;
  log: string | null;
}

function toExecution(row: BackupExecutionRow): BackupExecution {
  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    sizeBytes: row.size_bytes !== null ? Number(row.size_bytes) : null,
    log: row.log,
  };
}

export async function listExecutionsByJob(jobId: number): Promise<BackupExecution[]> {
  const result = await pool.query<BackupExecutionRow>(
    `SELECT id, job_id, status, started_at, finished_at, size_bytes, log
     FROM backup_executions WHERE job_id = $1 ORDER BY started_at DESC`,
    [jobId],
  );
  return result.rows.map(toExecution);
}
