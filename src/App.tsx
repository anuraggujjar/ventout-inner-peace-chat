import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthPage } from "@/pages/AuthPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import FeelingSelectionPage from "./pages/FeelingSelectionPage";
import ChatRequestSentPage from "./pages/ChatRequestSentPage";
import ListenerHomePage from "./pages/ListenerHomePage";
import TalkerListPage from "./pages/TalkerListPage"; 
import LiveChatPage from "./pages/LiveChatPage";
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
        <AuthProvider>
          <SocketProvider>
            <SecurityProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/listener/home" element={<ListenerHomePage />} />
                  <Route path="/talker-list" element={<TalkerListPage />} />
                  <Route path="/live-chat/:talkerId" element={<LiveChatPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/topic-selection" element={<TopicSelectionPage />} />
                  <Route path="/feeling-selection" element={<FeelingSelectionPage />} />
                  <Route path="/chat-request-sent" element={<ChatRequestSentPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </TooltipProvider>
            </SecurityProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;