
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

const TreeAnimation = () => {
  return (
    <div className="flex justify-center items-center mb-8">
      <div className="relative w-24 h-32">
        {/* Tree trunk */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-amber-800 rounded-sm"></div>
        
        {/* Tree leaves - multiple layers for depth */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          {/* Bottom layer */}
          <div className="w-16 h-12 bg-green-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] opacity-80"></div>
          {/* Middle layer */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-green-400 rounded-full animate-[pulse_2.5s_ease-in-out_infinite] opacity-90"></div>
          {/* Top layer */}
          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-300 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
        </div>
        
        {/* Floating leaves */}
        <div className="absolute top-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-[bounce_4s_ease-in-out_infinite] opacity-70"></div>
        <div className="absolute top-4 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-[bounce_3s_ease-in-out_infinite_0.5s] opacity-60"></div>
        <div className="absolute top-8 left-1 w-1 h-1 bg-green-300 rounded-full animate-[bounce_3.5s_ease-in-out_infinite_1s] opacity-50"></div>
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
        <TreeAnimation />
        <h1 className="text-4xl font-bold text-primary mb-2">VentOut</h1>
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
