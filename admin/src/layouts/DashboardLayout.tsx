/**
 * Dashboard Layout
 *
 * Main layout for authenticated admin screens.
 *
 * Structure:
 * - Sidebar with navigation
 * - Main content area
 *
 * Uses AuthContext for user info and logout.
 */

import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Nadzorna ploca', icon: '📊', testId: 'sidebar-link-dashboard' },
  { path: '/messages', label: 'Poruke', icon: '✉️', testId: 'sidebar-link-inbox' },
  { path: '/feedback', label: 'Povratne inf.', icon: '💬', testId: 'sidebar-link-feedback' },
  { path: '/click-fix', label: 'Click & Fix', icon: '📍', testId: 'sidebar-link-clickfix' },
  { path: '/events', label: 'Dogadaji', icon: '📅', testId: 'sidebar-link-events' },
  { path: '/pages', label: 'Stranice', icon: '📄', testId: 'sidebar-link-pages' },
  { path: '/menu-extras', label: 'Izbornik+', icon: '📋', testId: 'sidebar-link-menu-extras' },
  { path: '/transport', label: 'Promet', icon: '🚌', testId: 'sidebar-link-transport' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>MOJ VIS</h1>
          <p style={styles.logoSubtext}>Admin</p>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Odjava
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.headerUser}>
              {user?.username || 'Admin'} ({user?.municipality || '—'})
            </span>
          </div>
        </header>

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    padding: '24px',
    borderBottom: '1px solid #333333',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  logoSubtext: {
    fontSize: '12px',
    color: '#888888',
    margin: 0,
    marginTop: '4px',
  },
  nav: {
    flex: 1,
    padding: '16px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#cccccc',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  navItemActive: {
    backgroundColor: '#333333',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '18px',
  },
  sidebarFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #333333',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid #666666',
    borderRadius: '4px',
    color: '#cccccc',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
  },
  headerContent: {
    marginLeft: 'auto',
  },
  headerUser: {
    fontSize: '14px',
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: '24px',
  },
};

export default DashboardLayout;
