-- Up Migration

CREATE TABLE backup_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX backup_jobs_user_id_idx ON backup_jobs(user_id);

-- Down Migration

DROP TABLE backup_jobs;
