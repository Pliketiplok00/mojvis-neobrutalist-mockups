/**
 * Login Page
 *
 * Admin/Supervisor authentication entry point.
 *
 * Rules (per spec):
 * - Web login required for Admin/Supervisor access
 * - HR-only UI for MVP (no English needed)
 *
 * Phase 0: UI skeleton only, no auth logic.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // TODO: Implement actual authentication
    console.info('Login attempt:', { email });

    // Phase 0: Just navigate to dashboard
    if (email && password) {
      setError(null);
      navigate('/dashboard');
    } else {
      setError('Unesite email i lozinku');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MOJ VIS</h1>
        <p style={styles.subtitle}>Admin Panel</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@mojvis.hr"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Prijava
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '48px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
    color: '#000000',
  },
  subtitle: {
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '32px',
    color: '#666666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #dddddd',
    borderRadius: '4px',
    outline: 'none',
  },
  error: {
    color: '#d32f2f',
    fontSize: '14px',
    margin: 0,
  },
  button: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#000000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default LoginPage;
