import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import QuoteCard from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Moon, Sun, History as HistoryIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

const initialQuotes = [
  {
    quote: "The best way out is always through.",
    author: "Robert Frost"
  },
  {
    quote: "It's okay not to be okay as long as you are not giving up.",
    author: "Unknown"
  },
  {
    quote: "Your present circumstances don't determine where you can go; they merely determine where you start.",
    author: "Nido Qubein"
  }
];

const Index = () => {
  const [currentQuote, setCurrentQuote] = useState(initialQuotes[0]);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefreshQuote = () => {
    const currentIndex = initialQuotes.findIndex(q => q.quote === currentQuote.quote);
    const nextIndex = (currentIndex + 1) % initialQuotes.length;
    setCurrentQuote(initialQuotes[nextIndex]);
    console.log("Quote refreshed");
  };

  const handleStartTalking = () => {
    console.log("Start Talking clicked");
    navigate('/chat');
  };

  const handleGoToHistory = () => {
    console.log("History button clicked");
    navigate('/history');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center py-8">
        <img src="/lovable.svg" alt="VentOut Logo" className="h-16 w-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">VentOut</h1>
        <p className="text-muted-foreground mb-8">Your safe space to be heard.</p>

        <QuoteCard
          quote={currentQuote.quote}
          author={currentQuote.author}
          onRefresh={handleRefreshQuote}
        />

        <Button 
          size="lg" 
          className="w-full max-w-xs py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md animate-pulse mb-6"
          onClick={handleStartTalking}
        >
          <MessageSquare className="mr-2 h-6 w-6" />
          Start Talking
        </Button>
        <p className="text-xs text-muted-foreground mt-[-1rem] mb-6">Connect anonymously with a listener.</p>

        <div className="w-full max-w-xs space-y-4 mb-8">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full py-3 text-lg rounded-xl shadow-sm"
            onClick={handleGoToHistory}
          >
            <HistoryIcon className="mr-2 h-6 w-6" />
            View History
          </Button>

          <div className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border">
            <Label htmlFor="dark-mode-toggle" className="flex items-center text-foreground">
              {theme === 'dark' ? <Moon className="mr-2 h-5 w-5 text-primary" /> : <Sun className="mr-2 h-5 w-5 text-primary" />}
              Dark Mode
            </Label>
            <Switch
              id="dark-mode-toggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
