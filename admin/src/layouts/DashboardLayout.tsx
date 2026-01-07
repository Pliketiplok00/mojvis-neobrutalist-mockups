/**
 * Dashboard Layout
 *
 * Main layout for authenticated admin screens.
 *
 * Structure:
 * - Sidebar with navigation
 * - Main content area
 *
 * Phase 0: Basic structure, no auth check.
 */

import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Nadzorna ploča', icon: '📊' },
  { path: '/messages', label: 'Poruke', icon: '✉️' },
  { path: '/events', label: 'Događaji', icon: '📅' },
  { path: '/pages', label: 'Stranice', icon: '📄' },
  { path: '/transport', label: 'Promet', icon: '🚌' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Implement logout
    console.info('Logout clicked');
    window.location.href = '/login';
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
            {/* TODO: Add user info, notifications */}
            <span style={styles.headerUser}>Admin</span>
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
