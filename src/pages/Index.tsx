import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import QuoteCard from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { MessageSquare, Video } from 'lucide-react'; // Removed HistoryIcon

const initialQuotes = [{
  quote: "The best way out is always through.",
  author: "Robert Frost"
}, {
  quote: "It's okay not to be okay as long as you are not giving up.",
  author: "Unknown"
}, {
  quote: "Your present circumstances don't determine where you can go; they merely determine where you start.",
  author: "Nido Qubein"
}];
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
  return <Layout>
      <div className="flex flex-col items-center justify-center text-center py-8 bg-stone-100">
        <img src="/lovable.svg" alt="VentOut Logo" className="h-16 w-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">VentOut</h1>
        <p className="text-muted-foreground mb-8">Your safe space to be heard.</p>

        <QuoteCard quote={currentQuote.quote} author={currentQuote.author} onRefresh={handleRefreshQuote} />

        <div className="w-full max-w-xs space-y-4 mb-6">
          <Button size="lg" className="w-full py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md" onClick={handleStartTalking}>
            <MessageSquare className="mr-2 h-6 w-6" />
            Start Talking
          </Button>
          <p className="text-xs text-muted-foreground mt-[-0.5rem] mb-2">Connect anonymously with a listener.</p>

          <Button size="lg" variant="outline" className="w-full py-3 text-lg bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground rounded-xl shadow-md border-dashed border-primary/50" disabled>
            <Video className="mr-2 h-6 w-6" />
            Video Call
          </Button>
          <p className="text-xs text-muted-foreground mt-[-0.5rem] mb-2">Coming Soon!</p>
        </div>
        
        {/* Removed the View History button and its container div */}
      </div>
    </Layout>;
};
export default Index;