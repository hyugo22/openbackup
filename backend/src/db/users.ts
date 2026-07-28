import { pool } from './pool.js';
import type { User } from '../types/index.js';

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`,
    [email, passwordHash],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Echec de la creation de l\'utilisateur');
  return toUser(row);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
    [email],
  );
  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, created_at FROM users WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}
