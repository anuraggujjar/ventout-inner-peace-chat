import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Headphones, Moon, Sun, User, Home, History, Settings } from "lucide-react";
import QuoteCard from "@/components/QuoteCard";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ListenerHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get role-based home path
  const homePath = user?.role === 'listener' ? '/listener/home' : '/';

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes treeSway {
            0%, 100% { transform: rotate(-1.5deg); }
            50% { transform: rotate(1.5deg); }
          }
          @keyframes leafBreath {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          @keyframes birdFlight {
            0%   { transform: translate(-30px, 10px) scale(0.7); opacity: 0; }
            10%  { opacity: 1; }
            50%  { transform: translate(70px, -8px) scale(1); opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translate(170px, 4px) scale(0.7); opacity: 0; }
          }
          @keyframes birdFlap {
            0%, 100% { transform: scaleY(1); }
            50%      { transform: scaleY(0.55); }
          }
          @keyframes groundGlow {
            0%, 100% { opacity: 0.4; }
            50%      { opacity: 0.7; }
          }
        `
      }} />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-primary">Plaro</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full bg-primary/10 text-primary"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-6 pb-32 overflow-y-auto" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="relative mx-auto mb-4 h-28 w-36 overflow-hidden" aria-hidden="true">
            {/* Bird flying across */}
            <svg
              viewBox="0 0 24 12"
              className="absolute top-3 left-0 h-3 w-6 text-primary"
              style={{ animation: 'birdFlight 9s ease-in-out infinite' }}
            >
              <g style={{ animation: 'birdFlap 0.55s ease-in-out infinite', transformOrigin: '50% 50%' }}>
                <path
                  d="M2 8 Q6 2 12 6 Q18 2 22 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* Tree */}
            <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full">
              <path d="M48 78 L52 78 L51 52 L49 52 Z" className="fill-muted-foreground/60" />
              <g style={{ animation: 'treeSway 6s ease-in-out infinite', transformOrigin: '50px 78px' }}>
                <circle cx="50" cy="40" r="18" className="fill-primary/30" style={{ animation: 'leafBreath 5s ease-in-out infinite' }} />
                <circle cx="38" cy="50" r="13" className="fill-primary/25" style={{ animation: 'leafBreath 6s ease-in-out infinite 0.8s' }} />
                <circle cx="62" cy="50" r="13" className="fill-primary/25" style={{ animation: 'leafBreath 6.5s ease-in-out infinite 1.4s' }} />
                <circle cx="50" cy="30" r="11" className="fill-secondary/50" style={{ animation: 'leafBreath 5.5s ease-in-out infinite 0.4s' }} />
                <circle cx="44" cy="36" r="6" className="fill-accent/40" style={{ animation: 'leafBreath 4.5s ease-in-out infinite 1.8s' }} />
                <circle cx="58" cy="36" r="5" className="fill-accent/40" style={{ animation: 'leafBreath 5s ease-in-out infinite 2.2s' }} />
              </g>
              <line x1="20" y1="79" x2="80" y2="79" className="stroke-primary/40" strokeWidth="0.6" strokeLinecap="round" style={{ animation: 'groundGlow 5s ease-in-out infinite' }} />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-primary mb-2">Plaro</h2>
          <p className="text-lg text-muted-foreground">Your safe space to be heard.</p>
        </div>

        {/* Quote Card */}
        <div className="w-full max-w-md mb-8">
          <QuoteCard 
            quote="Every person you meet is fighting a battle you know nothing about. Be kind. Always."
            author="Anonymous"
            onRefresh={() => {}}
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-4">
            <Button
              size="lg"
              className="w-full text-primary-foreground rounded-3xl py-6 text-lg font-medium"
              onClick={() => navigate("/talker-list")}
            >
              <Headphones className="w-5 h-5 mr-2" />
              Be a Listener
            </Button>
            <p className="text-sm text-muted-foreground">
              Help others by listening with compassion.
            </p>
          </div>

          <div className="text-center space-y-4">
            <Button
              size="lg"
              variant="secondary"
              className="w-full rounded-3xl py-4 text-base font-medium"
              onClick={() => navigate("/topic-selection")}
            >
              Start Talking
            </Button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
        <div className="flex items-center justify-around py-4">
          <button 
            onClick={() => navigate(homePath)}
            className="flex flex-col items-center space-y-1 text-primary p-2 rounded-xl"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={() => navigate("/history")}
            className="flex flex-col items-center space-y-1 text-muted-foreground p-2 rounded-xl hover:text-primary transition-colors"
          >
            <History className="w-6 h-6" />
            <span className="text-xs">History</span>
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center space-y-1 text-muted-foreground p-2 rounded-xl hover:text-primary transition-colors"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ListenerHomePage;