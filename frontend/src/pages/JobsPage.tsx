import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import * as jobsApi from '../api/jobs';
import type { JobInput } from '../api/jobs';
import type { BackupJob } from '../types';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyForm: JobInput = { name: '', sourcePath: '', destinationPath: '' };

export function JobsPage() {
  const { deleteAccount } = useAuth();
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setJobs(await jobsApi.listJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des jobs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId !== null) {
        await jobsApi.updateJob(editingId, form);
      } else {
        await jobsApi.createJob(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de l\'enregistrement du job');
    }
  }

  function startEdit(job: BackupJob) {
    setEditingId(job.id);
    setForm({ name: job.name, sourcePath: job.sourcePath, destinationPath: job.destinationPath });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce job de backup ?')) return;
    try {
      await jobsApi.deleteJob(id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la suppression');
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Supprimer definitivement votre compte et toutes vos donnees ?')) return;
    await deleteAccount();
  }

  return (
    <div>
      <h1>Jobs de backup</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="job-form">
        <label>
          Nom
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Chemin source
          <input
            value={form.sourcePath}
            onChange={(e) => setForm({ ...form, sourcePath: e.target.value })}
            required
          />
        </label>
        <label>
          Chemin de destination
          <input
            value={form.destinationPath}
            onChange={(e) => setForm({ ...form, destinationPath: e.target.value })}
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId !== null ? 'Mettre a jour' : 'Creer le job'}</button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : jobs.length === 0 ? (
        <p>Aucun job de backup pour le moment.</p>
      ) : (
        <ul className="job-list">
          {jobs.map((job) => (
            <li key={job.id}>
              <div>
                <strong>{job.name}</strong>
                <div className="job-paths">
                  {job.sourcePath} → {job.destinationPath}
                </div>
              </div>
              <div className="job-actions">
                <Link to={`/jobs/${job.id}/history`}>Historique</Link>
                <button type="button" onClick={() => startEdit(job)}>
                  Modifier
                </button>
                <button type="button" onClick={() => void handleDelete(job.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="danger-zone">
        <h2>Compte</h2>
        <p>Supprimer votre compte efface definitivement vos jobs et votre historique.</p>
        <button type="button" onClick={() => void handleDeleteAccount()}>
          Supprimer mon compte
        </button>
      </section>
    </div>
  );
}
