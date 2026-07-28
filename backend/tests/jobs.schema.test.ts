import { describe, expect, it } from 'vitest';
import { createJobSchema } from '../src/validation/jobs.schema.js';

describe('createJobSchema', () => {
  it('accepte un job valide', () => {
    const result = createJobSchema.safeParse({
      name: 'Backup documents',
      sourcePath: '/home/user/documents',
      destinationPath: '/mnt/backup/documents',
    });
    expect(result.success).toBe(true);
  });

  it('rejette un nom vide', () => {
    const result = createJobSchema.safeParse({
      name: '  ',
      sourcePath: '/src',
      destinationPath: '/dst',
    });
    expect(result.success).toBe(false);
  });

  it('rejette un chemin de destination manquant', () => {
    const result = createJobSchema.safeParse({ name: 'Backup', sourcePath: '/src' });
    expect(result.success).toBe(false);
  });
});
