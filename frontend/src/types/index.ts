export interface User {
  id: number;
  email: string;
}

export interface BackupJob {
  id: number;
  userId: number;
  name: string;
  sourcePath: string;
  destinationPath: string;
  createdAt: string;
  updatedAt: string;
}

export type ExecutionStatus = 'success' | 'failure' | 'running';

export interface BackupExecution {
  id: number;
  jobId: number;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt: string | null;
  sizeBytes: number | null;
  log: string | null;
}
