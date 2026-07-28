-- Up Migration

CREATE TYPE execution_status AS ENUM ('success', 'failure', 'running');

CREATE TABLE backup_executions (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES backup_jobs(id) ON DELETE CASCADE,
  status execution_status NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  size_bytes BIGINT,
  log TEXT
);

CREATE INDEX backup_executions_job_id_idx ON backup_executions(job_id);

-- Down Migration

DROP TABLE backup_executions;
DROP TYPE execution_status;
