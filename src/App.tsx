
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import FeelingSelectionPage from "./pages/FeelingSelectionPage";
import ChatRequestSentPage from "./pages/ChatRequestSentPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { ListenerHomePage } from "./pages/ListenerHomePage";
import { TalkerDashboard } from "./pages/TalkerDashboard";
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
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/home" 
                    element={
                      <ProtectedRoute requiredRole="talker">
                        <TalkerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/listener/home" 
                    element={
                      <ProtectedRoute requiredRole="listener">
                        <ListenerHomePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/topic-selection" 
                    element={
                      <ProtectedRoute>
                        <TopicSelectionPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/feeling-selection" 
                    element={
                      <ProtectedRoute>
                        <FeelingSelectionPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat-request-sent" 
                    element={
                      <ProtectedRoute>
                        <ChatRequestSentPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </SecurityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
