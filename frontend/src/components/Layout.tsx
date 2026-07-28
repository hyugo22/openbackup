import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="brand">
          OpenBackup
        </Link>
        {user && (
          <div className="header-actions">
            <span>{user.email}</span>
            <button type="button" onClick={() => void logout()}>
              Deconnexion
            </button>
          </div>
        )}
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
