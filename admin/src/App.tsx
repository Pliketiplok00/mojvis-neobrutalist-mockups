/**
 * MOJ VIS Admin App
 *
 * Root component with routing.
 *
 * Phase 1: Added Inbox CRUD routes.
 * Phase 2: Added Events CRUD routes.
 * Phase 3: Added Static Pages CMS routes.
 * Phase 5: Added Feedback routes.
 * Phase 6: Added Click & Fix routes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes (TODO: Add auth guard) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/messages" element={<InboxListPage />} />
        <Route path="/messages/new" element={<InboxEditPage />} />
        <Route path="/messages/:id" element={<InboxEditPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/new" element={<EventEditPage />} />
        <Route path="/events/:id" element={<EventEditPage />} />
        <Route path="/pages" element={<PagesListPage />} />
        <Route path="/pages/new" element={<PageEditPage />} />
        <Route path="/pages/:id" element={<PageEditPage />} />
        <Route path="/feedback" element={<FeedbackListPage />} />
        <Route path="/feedback/:id" element={<FeedbackDetailPage />} />
        <Route path="/click-fix" element={<ClickFixListPage />} />
        <Route path="/click-fix/:id" element={<ClickFixDetailPage />} />
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
