import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InboxPage from "./pages/InboxPage";
import InboxDetailPage from "./pages/InboxDetailPage";
import EventsCalendarPage from "./pages/EventsCalendarPage";
import EventDetailPage from "./pages/EventDetailPage";
import ClickFixPage from "./pages/ClickFixPage";
import ClickFixReportPage from "./pages/ClickFixReportPage";
import FeedbackPage from "./pages/FeedbackPage";
import TransportPage from "./pages/TransportPage";
import TransportRoadPage from "./pages/TransportRoadPage";
import TransportRoadDetailPage from "./pages/TransportRoadDetailPage";
import OnboardingSplashPage from "./pages/OnboardingSplashPage";
import OnboardingModePage from "./pages/OnboardingModePage";
import OnboardingMunicipalityPage from "./pages/OnboardingMunicipalityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:id" element={<InboxDetailPage />} />
          <Route path="/events" element={<EventsCalendarPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/click-fix" element={<ClickFixPage />} />
          <Route path="/click-fix/report" element={<ClickFixReportPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/transport/road" element={<TransportRoadPage />} />
          <Route path="/transport/road/:lineId" element={<TransportRoadDetailPage />} />
          <Route path="/onboarding" element={<OnboardingSplashPage />} />
          <Route path="/onboarding/mode" element={<OnboardingModePage />} />
          <Route path="/onboarding/municipality" element={<OnboardingMunicipalityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
