import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../src/validation/auth.schema.js';

describe('registerSchema', () => {
  it('accepte un email et un mot de passe valides', () => {
    const result = registerSchema.safeParse({
      email: 'User@Example.com',
      password: 'motdepasse-long',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejette un email invalide', () => {
    const result = registerSchema.safeParse({ email: 'pas-un-email', password: 'motdepasse-long' });
    expect(result.success).toBe(false);
  });

  it('rejette un mot de passe trop court', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: 'court' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('rejette un mot de passe vide', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});
