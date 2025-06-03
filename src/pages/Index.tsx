
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import QuoteCard from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

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

const SoothingAnimation = () => {
  return (
    <div className="flex justify-center items-center mb-8">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-2 border-primary/30 animate-pulse"></div>
        {/* Middle ring */}
        <div className="absolute inset-2 w-16 h-16 rounded-full border-2 border-primary/50 animate-[pulse_2s_ease-in-out_infinite]"></div>
        {/* Inner ring */}
        <div className="absolute inset-4 w-12 h-12 rounded-full border-2 border-primary/70 animate-[pulse_3s_ease-in-out_infinite]"></div>
        {/* Center dot */}
        <div className="absolute inset-8 w-4 h-4 rounded-full bg-primary animate-[pulse_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

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
    navigate('/topic-selection');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center py-8">
        <SoothingAnimation />
        <h1 className="text-4xl font-bold text-primary mb-2">Sola</h1>
        <p className="text-muted-foreground mb-8">Your safe space to be heard.</p>

        <QuoteCard
          quote={currentQuote.quote}
          author={currentQuote.author}
          onRefresh={handleRefreshQuote}
        />

        <div className="w-full max-w-xs space-y-4 mb-6">
          <Button 
            size="lg" 
            className="w-full py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md"
            onClick={handleStartTalking}
          >
            <MessageSquare className="mr-2 h-6 w-6" />
            Start Talking
          </Button>
          <p className="text-xs text-muted-foreground mt-[-0.5rem] mb-2">Connect anonymously with a listener.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
