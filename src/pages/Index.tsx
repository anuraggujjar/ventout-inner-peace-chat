
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

const HealingAnimation = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.6; }
            25% { transform: translateY(-15px) translateX(5px) rotate(5deg); opacity: 0.8; }
            50% { transform: translateY(-8px) translateX(-3px) rotate(-3deg); opacity: 1; }
            75% { transform: translateY(-20px) translateX(2px) rotate(2deg); opacity: 0.7; }
          }
          
          @keyframes breatheGlow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
          }
          
          @keyframes pulseHeart {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            50% { transform: scale(1.15) rotate(2deg); opacity: 1; }
          }
          
          @keyframes waveMotion {
            0% { transform: translateX(-100px) scaleY(1); }
            50% { transform: translateX(0px) scaleY(1.1); }
            100% { transform: translateX(100px) scaleY(1); }
          }
          
          @keyframes colorShift {
            0% { background: linear-gradient(135deg, #a78bfa, #c084fc); }
            25% { background: linear-gradient(135deg, #60a5fa, #34d399); }
            50% { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
            75% { background: linear-gradient(135deg, #fb7185, #f43f5e); }
            100% { background: linear-gradient(135deg, #a78bfa, #c084fc); }
          }
        `
      }} />
      
      <div className="flex justify-center items-center mb-8">
        <div className="relative w-40 h-32 overflow-hidden">
          {/* Central breathing orb */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full opacity-80" 
               style={{ animation: 'breatheGlow 4s ease-in-out infinite' }}></div>
          
          {/* Floating healing particles */}
          <div className="absolute top-2 left-4 w-3 h-3 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-70"
               style={{ animation: 'gentleFloat 6s ease-in-out infinite' }}></div>
          <div className="absolute top-8 right-6 w-2 h-2 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-60"
               style={{ animation: 'gentleFloat 5s ease-in-out infinite 1s' }}></div>
          <div className="absolute bottom-4 left-2 w-2.5 h-2.5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-65"
               style={{ animation: 'gentleFloat 7s ease-in-out infinite 2s' }}></div>
          <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-70"
               style={{ animation: 'gentleFloat 4.5s ease-in-out infinite 1.5s' }}></div>
          
          {/* Gentle wave motion */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-40"
               style={{ animation: 'waveMotion 8s linear infinite' }}></div>
          <div className="absolute bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-30"
               style={{ animation: 'waveMotion 6s linear infinite 2s' }}></div>
          
          {/* Pulsing heart-like elements */}
          <div className="absolute top-6 right-2 w-4 h-4 bg-gradient-to-br from-red-300 to-pink-400 rounded-full opacity-75"
               style={{ animation: 'pulseHeart 3s ease-in-out infinite' }}></div>
          <div className="absolute bottom-8 right-8 w-3 h-3 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-70"
               style={{ animation: 'pulseHeart 2.5s ease-in-out infinite 0.5s' }}></div>
          
          {/* Color-shifting background elements */}
          <div className="absolute top-3 left-8 w-6 h-6 rounded-full opacity-20"
               style={{ animation: 'colorShift 10s ease-in-out infinite, gentleFloat 8s ease-in-out infinite' }}></div>
          <div className="absolute bottom-6 right-4 w-5 h-5 rounded-full opacity-15"
               style={{ animation: 'colorShift 12s ease-in-out infinite 3s, gentleFloat 9s ease-in-out infinite 2s' }}></div>
        </div>
      </div>
    </>
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
        <HealingAnimation />
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
