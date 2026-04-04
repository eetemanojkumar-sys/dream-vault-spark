import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import BottomNav from "@/components/social/BottomNav";
import PageTransition from "@/components/PageTransition";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Dreams from "./pages/Dreams";
import DreamDetail from "./pages/DreamDetail";
import SharedDream from "./pages/SharedDream";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import DreamGPT from "./pages/DreamGPT";
import NotFound from "./pages/NotFound";
import StoryCreator from "./pages/StoryCreator";

const GalaxyBackground = lazy(() => import("@/components/background/GalaxyBackground"));

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const hideNav = ["/", "/auth"].includes(location.pathname);
  const showBottomNav = user && !hideNav;

  return (
    <>
      <Suspense fallback={null}>
        <GalaxyBackground />
      </Suspense>
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/dreams" element={<PageTransition><Dreams /></PageTransition>} />
            <Route path="/dreams/:id" element={<PageTransition><DreamDetail /></PageTransition>} />
            <Route path="/shared/:token" element={<PageTransition><SharedDream /></PageTransition>} />
            <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
            <Route path="/profile/:userId" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
            <Route path="/dream-gpt" element={<PageTransition><DreamGPT /></PageTransition>} />
            <Route path="/story-creator" element={<PageTransition><StoryCreator /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
        {showBottomNav && <BottomNav />}
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
