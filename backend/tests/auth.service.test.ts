import { describe, expect, it } from 'vitest';
import { hashPassword, signToken, verifyPassword, verifyToken } from '../src/services/auth.service.js';

describe('auth.service — mots de passe', () => {
  it('hache un mot de passe et le verifie correctement', async () => {
    const hash = await hashPassword('mot-de-passe-solide');
    expect(hash).not.toBe('mot-de-passe-solide');
    await expect(verifyPassword('mot-de-passe-solide', hash)).resolves.toBe(true);
  });

  it('rejette un mauvais mot de passe', async () => {
    const hash = await hashPassword('mot-de-passe-solide');
    await expect(verifyPassword('autre-mot-de-passe', hash)).resolves.toBe(false);
  });
});

describe('auth.service — JWT', () => {
  it('signe puis verifie un token pour retrouver le meme userId', () => {
    const token = signToken(42);
    expect(verifyToken(token)).toBe(42);
  });

  it("rejette un token invalide", () => {
    expect(() => verifyToken('token-invalide')).toThrow();
  });
});
