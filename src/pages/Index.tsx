
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
      <div className="relative w-32 h-36">
        {/* Tree trunk with gentle sway */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-10 bg-gradient-to-t from-amber-900 to-amber-700 rounded-sm animate-[sway_4s_ease-in-out_infinite]"></div>
        
        {/* Tree leaves with swaying and color transitions */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-[sway_3s_ease-in-out_infinite]">
          {/* Bottom layer */}
          <div className="w-20 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-[breathe_4s_ease-in-out_infinite] opacity-85 shadow-lg"></div>
          {/* Middle layer */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full animate-[breathe_3s_ease-in-out_infinite_0.5s] opacity-90 shadow-md"></div>
          {/* Top layer */}
          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-gradient-to-br from-lime-300 to-green-300 rounded-full animate-[breathe_2.5s_ease-in-out_infinite_1s] shadow-sm"></div>
        </div>
        
        {/* Floating petals/leaves with gentle drift */}
        <div className="absolute top-3 -left-3 w-2 h-2 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full animate-[float_6s_ease-in-out_infinite] opacity-70 shadow-sm"></div>
        <div className="absolute top-6 -right-2 w-1.5 h-1.5 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full animate-[float_5s_ease-in-out_infinite_1s] opacity-60 shadow-sm"></div>
        <div className="absolute top-10 left-2 w-1 h-1 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full animate-[float_7s_ease-in-out_infinite_2s] opacity-50"></div>
        <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full animate-[float_4.5s_ease-in-out_infinite_1.5s] opacity-65"></div>
        
        {/* Gentle wind particles */}
        <div className="absolute top-12 -left-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-[drift_8s_linear_infinite] opacity-80"></div>
        <div className="absolute top-16 right-0 w-0.5 h-0.5 bg-white/30 rounded-full animate-[drift_6s_linear_infinite_2s] opacity-70"></div>
        <div className="absolute top-8 -right-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-[drift_7s_linear_infinite_1s] opacity-60"></div>
      </div>
      
      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: translateX(-50%) rotate(-1deg); }
          50% { transform: translateX(-50%) rotate(1deg); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(1deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.7; }
          25% { transform: translateY(-8px) translateX(3px) rotate(90deg); opacity: 0.9; }
          50% { transform: translateY(-4px) translateX(-2px) rotate(180deg); opacity: 0.6; }
          75% { transform: translateY(-10px) translateX(1px) rotate(270deg); opacity: 0.8; }
        }
        
        @keyframes drift {
          0% { transform: translateX(-20px) translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(40px) translateY(-15px); opacity: 0; }
        }
      `}</style>
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
