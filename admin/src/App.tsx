/**
 * MOJ VIS Admin App
 *
 * Root component with routing and authentication.
 *
 * Phase 1: Added Inbox CRUD routes.
 * Phase 2: Added Events CRUD routes.
 * Phase 3: Added Static Pages CMS routes.
 * Phase 5: Added Feedback routes.
 * Phase 6: Added Click & Fix routes.
 * Phase 2.5: Added cookie-session authentication.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthGuard } from './services/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InboxListPage } from './pages/inbox/InboxListPage';
import { InboxEditPage } from './pages/inbox/InboxEditPage';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventEditPage } from './pages/events/EventEditPage';
import { PagesListPage } from './pages/pages/PagesListPage';
import { PageEditPage } from './pages/pages/PageEditPage';
import { FeedbackListPage } from './pages/feedback/FeedbackListPage';
import { FeedbackDetailPage } from './pages/feedback/FeedbackDetailPage';
import { ClickFixListPage } from './pages/click-fix/ClickFixListPage';
import { ClickFixDetailPage } from './pages/click-fix/ClickFixDetailPage';
import { MenuExtrasPage } from './pages/menu-extras/MenuExtrasPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes - wrapped with AuthGuard */}
          <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="/messages" element={<AuthGuard><InboxListPage /></AuthGuard>} />
          <Route path="/messages/new" element={<AuthGuard><InboxEditPage /></AuthGuard>} />
          <Route path="/messages/:id" element={<AuthGuard><InboxEditPage /></AuthGuard>} />
          <Route path="/events" element={<AuthGuard><EventsListPage /></AuthGuard>} />
          <Route path="/events/new" element={<AuthGuard><EventEditPage /></AuthGuard>} />
          <Route path="/events/:id" element={<AuthGuard><EventEditPage /></AuthGuard>} />
          <Route path="/pages" element={<AuthGuard><PagesListPage /></AuthGuard>} />
          <Route path="/pages/new" element={<AuthGuard><PageEditPage /></AuthGuard>} />
          <Route path="/pages/:id" element={<AuthGuard><PageEditPage /></AuthGuard>} />
          <Route path="/feedback" element={<AuthGuard><FeedbackListPage /></AuthGuard>} />
          <Route path="/feedback/:id" element={<AuthGuard><FeedbackDetailPage /></AuthGuard>} />
          <Route path="/click-fix" element={<AuthGuard><ClickFixListPage /></AuthGuard>} />
          <Route path="/click-fix/:id" element={<AuthGuard><ClickFixDetailPage /></AuthGuard>} />
          <Route path="/transport" element={<AuthGuard><PlaceholderPage title="Promet" /></AuthGuard>} />
          <Route path="/menu-extras" element={<AuthGuard><MenuExtrasPage /></AuthGuard>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
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
