import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import QuoteCard from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { MessageSquare, History as HistoryIcon } from 'lucide-react';

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
        </div>
      </div>
    </Layout>
  );
};

export default Index;
