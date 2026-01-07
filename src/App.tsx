import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import HomePage from "./pages/HomePage";
import InboxPage from "./pages/InboxPage";
import InboxDetailPage from "./pages/InboxDetailPage";
import EventsCalendarPage from "./pages/EventsCalendarPage";
import EventDetailPage from "./pages/EventDetailPage";
import ClickFixPage from "./pages/ClickFixPage";
import FeedbackPage from "./pages/FeedbackPage";
import TransportPage from "./pages/TransportPage";
import TransportRoadPage from "./pages/TransportRoadPage";
import TransportRoadDetailPage from "./pages/TransportRoadDetailPage";
import TransportSeaPage from "./pages/TransportSeaPage";
import TransportSeaDetailPage from "./pages/TransportSeaDetailPage";
import SettingsPage from "./pages/SettingsPage";
import FloraPage from "./pages/FloraPage";
import FaunaPage from "./pages/FaunaPage";
import InfoPage from "./pages/InfoPage";
import OnboardingSplashPage from "./pages/OnboardingSplashPage";
import OnboardingModePage from "./pages/OnboardingModePage";
import OnboardingMunicipalityPage from "./pages/OnboardingMunicipalityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
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
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/transport/road" element={<TransportRoadPage />} />
            <Route path="/transport/road/:lineId" element={<TransportRoadDetailPage />} />
            <Route path="/transport/sea" element={<TransportSeaPage />} />
            <Route path="/transport/sea/:lineId" element={<TransportSeaDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/flora" element={<FloraPage />} />
            <Route path="/fauna" element={<FaunaPage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/onboarding" element={<OnboardingSplashPage />} />
            <Route path="/onboarding/mode" element={<OnboardingModePage />} />
            <Route path="/onboarding/municipality" element={<OnboardingMunicipalityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
