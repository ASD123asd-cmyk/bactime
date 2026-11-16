import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudyTracker from "./pages/StudyTracker";
import BacCalculator from "./pages/BacCalculator";
import Focus from "./pages/Focus";
import AppShell from "./components/AppShell";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MotionConfig } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/study-tracker" element={<StudyTracker />} />
              <Route path="/bac-calculator" element={<BacCalculator />} />
              <Route path="/focus" element={<Focus />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </TooltipProvider>
      </MotionConfig>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
