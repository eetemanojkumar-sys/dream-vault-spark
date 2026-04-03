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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dreams" element={<Dreams />} />
          <Route path="/dreams/:id" element={<DreamDetail />} />
          <Route path="/shared/:token" element={<SharedDream />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dream-gpt" element={<DreamGPT />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
