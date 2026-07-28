import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as jobsApi from '../api/jobs';
import type { BackupExecution } from '../types';
import { ApiError } from '../api/client';

function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function JobHistoryPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [executions, setExecutions] = useState<BackupExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    jobsApi
      .listExecutions(Number(jobId))
      .then(setExecutions)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Erreur de chargement de l\'historique'),
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div>
      <p>
        <Link to="/">← Retour aux jobs</Link>
      </p>
      <h1>Historique des executions</h1>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : executions.length === 0 ? (
        <p>
          Aucune execution enregistree pour ce job. La planification et l'execution automatique
          des backups seront ajoutees dans une prochaine version.
        </p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Statut</th>
              <th>Debut</th>
              <th>Fin</th>
              <th>Taille</th>
              <th>Log</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <tr key={execution.id}>
                <td>
                  <span className={`status status-${execution.status}`}>{execution.status}</span>
                </td>
                <td>{new Date(execution.startedAt).toLocaleString('fr-FR')}</td>
                <td>{execution.finishedAt ? new Date(execution.finishedAt).toLocaleString('fr-FR') : '—'}</td>
                <td>{formatBytes(execution.sizeBytes)}</td>
                <td>{execution.log ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
