/**
 * Dashboard Page
 *
 * Main landing page after login.
 * Shows quick links and overview stats.
 *
 * Phase 0: Placeholder content only.
 */

import { Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';

const quickLinks = [
  {
    title: 'Poruke',
    description: 'Upravljanje obavijestima i porukama',
    path: '/messages',
    icon: '✉️',
  },
  {
    title: 'Događaji',
    description: 'Kreiranje i uređivanje događaja',
    path: '/events',
    icon: '📅',
  },
  {
    title: 'Statične stranice',
    description: 'CMS upravljanje sadržajem',
    path: '/pages',
    icon: '📄',
  },
  {
    title: 'Promet',
    description: 'Vozni redovi i kontakti',
    path: '/transport',
    icon: '🚌',
  },
];

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 style={styles.title}>Nadzorna ploča</h1>
        <p style={styles.subtitle}>Dobrodošli u MOJ VIS administraciju</p>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>--</span>
            <span style={styles.statLabel}>Aktivnih obavijesti</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>--</span>
            <span style={styles.statLabel}>Nadolazećih događaja</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>--</span>
            <span style={styles.statLabel}>Neobrađenih povratnih informacija</span>
          </div>
        </div>

        {/* Quick Links */}
        <h2 style={styles.sectionTitle}>Brzi pristup</h2>
        <div style={styles.linksGrid}>
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} style={styles.linkCard}>
              <span style={styles.linkIcon}>{link.icon}</span>
              <div>
                <h3 style={styles.linkTitle}>{link.title}</h3>
                <p style={styles.linkDescription}>{link.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Phase 0 Notice */}
        <div style={styles.notice}>
          <p>
            <strong>Phase 0:</strong> Ovo je skeletna verzija. Funkcionalnost će biti dodana u
            kasnijim fazama.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666666',
    margin: 0,
    marginBottom: '32px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666666',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  linksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  linkCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    transition: 'box-shadow 0.2s',
  },
  linkIcon: {
    fontSize: '28px',
  },
  linkTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '4px',
    color: '#000000',
  },
  linkDescription: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },
  notice: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '14px',
    color: '#856404',
  },
};

export default DashboardPage;
