/**
 * MOJ VIS Admin App
 *
 * Root component with routing.
 *
 * Phase 0: Basic routing skeleton.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes (TODO: Add auth guard) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/messages" element={<PlaceholderPage title="Poruke" />} />
        <Route path="/events" element={<PlaceholderPage title="Događaji" />} />
        <Route path="/pages" element={<PlaceholderPage title="Statične stranice" />} />
        <Route path="/transport" element={<PlaceholderPage title="Promet" />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Placeholder page for routes not yet implemented
 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={placeholderStyles.container}>
      <h1>{title}</h1>
      <p style={placeholderStyles.message}>
        Ova stranica će biti implementirana u kasnijim fazama.
      </p>
      <a href="/dashboard" style={placeholderStyles.link}>
        ← Povratak na nadzornu ploču
      </a>
    </div>
  );
}

const placeholderStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#f8f9fa',
  },
  message: {
    color: '#666666',
    marginBottom: '24px',
  },
  link: {
    color: '#000000',
  },
};

export default App;
