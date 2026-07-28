import { apiFetch } from './client';
import type { BackupExecution, BackupJob } from '../types';

export interface JobInput {
  name: string;
  sourcePath: string;
  destinationPath: string;
}

export function listJobs(): Promise<BackupJob[]> {
  return apiFetch<BackupJob[]>('/api/jobs');
}

export function createJob(input: JobInput): Promise<BackupJob> {
  return apiFetch<BackupJob>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateJob(id: number, input: JobInput): Promise<BackupJob> {
  return apiFetch<BackupJob>(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteJob(id: number): Promise<void> {
  return apiFetch<void>(`/api/jobs/${id}`, { method: 'DELETE' });
}

export function listExecutions(jobId: number): Promise<BackupExecution[]> {
  return apiFetch<BackupExecution[]>(`/api/jobs/${jobId}/executions`);
}
