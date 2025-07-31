
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { AuthProvider } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import FeelingSelectionPage from "./pages/FeelingSelectionPage";
import ChatRequestSentPage from "./pages/ChatRequestSentPage";
import LoginPage from "./pages/LoginPage";
import PostAuthPage from "./pages/PostAuthPage";
import SelectRolePage from "./pages/SelectRolePage";
import TalkerHomePage from "./pages/TalkerHomePage";
import ListenerHomePage from "./pages/ListenerHomePage";
import './App.css';

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SecurityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/post-auth" element={<PostAuthPage />} />
                  <Route path="/select-role" element={<SelectRolePage />} />
                  <Route path="/talker/home" element={<TalkerHomePage />} />
                  <Route path="/listener/home" element={<ListenerHomePage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/topic-selection" element={<TopicSelectionPage />} />
                  <Route path="/feeling-selection" element={<FeelingSelectionPage />} />
                  <Route path="/chat-request-sent" element={<ChatRequestSentPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </SecurityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
