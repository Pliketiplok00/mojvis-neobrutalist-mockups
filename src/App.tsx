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
import FloraFaunaPage from "./pages/FloraFaunaPage";
import InfoPage from "./pages/InfoPage";
import OnboardingSplashPage from "./pages/OnboardingSplashPage";
import OnboardingModePage from "./pages/OnboardingModePage";
import OnboardingMunicipalityPage from "./pages/OnboardingMunicipalityPage";
import NotFound from "./pages/NotFound";

// V2 Pages - Bold Edition
import HomePageV2 from "./pages-v2/HomePageV2";
import InboxPageV2 from "./pages-v2/InboxPageV2";
import EventsCalendarPageV2 from "./pages-v2/EventsCalendarPageV2";
import TransportPageV2 from "./pages-v2/TransportPageV2";
import FeedbackPageV2 from "./pages-v2/FeedbackPageV2";
import ClickFixPageV2 from "./pages-v2/ClickFixPageV2";
import SettingsPageV2 from "./pages-v2/SettingsPageV2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* V1 Routes - Original */}
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
            
            {/* V2 Routes - Bold Edition */}
            <Route path="/v2" element={<HomePageV2 />} />
            <Route path="/v2/inbox" element={<InboxPageV2 />} />
            <Route path="/v2/inbox/:id" element={<InboxPageV2 />} />
            <Route path="/v2/events" element={<EventsCalendarPageV2 />} />
            <Route path="/v2/transport" element={<TransportPageV2 />} />
            <Route path="/v2/transport/road" element={<TransportPageV2 />} />
            <Route path="/v2/transport/sea" element={<TransportPageV2 />} />
            <Route path="/v2/feedback" element={<FeedbackPageV2 />} />
            <Route path="/v2/click-fix" element={<ClickFixPageV2 />} />
            <Route path="/v2/settings" element={<SettingsPageV2 />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
