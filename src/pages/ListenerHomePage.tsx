import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Headphones, Moon, Sun, User, Home, History, Settings } from "lucide-react";
import QuoteCard from "@/components/QuoteCard";
import { useState } from "react";

const ListenerHomePage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-primary">VentOut</h1>
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
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 pb-24">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-primary mb-4">VentOut</h2>
          <p className="text-xl text-muted-foreground">Your safe space to be heard.</p>
        </div>

        {/* Quote Card */}
        <div className="w-full max-w-md mb-12">
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
            onClick={() => navigate("/listener/home")}
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