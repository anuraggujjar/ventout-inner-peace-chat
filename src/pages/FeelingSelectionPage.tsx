
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';

const feelingOptions = [
  {
    id: 'ok',
    label: 'Feeling ok',
    emoji: '😊',
    color: 'from-green-500/20 to-green-600/10 border-green-500/30'
  },
  {
    id: 'not-ok',
    label: 'Not ok',
    emoji: '😔',
    color: 'from-red-500/20 to-red-600/10 border-red-500/30'
  },
  {
    id: 'dont-know',
    label: "Don't know",
    emoji: '🤷‍♀️',
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
  }
];

const FeelingSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const selectedTopic = location.state?.topic;

  // Automatic animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleFeelingSelect = (feelingId: string) => {
    setSelectedFeeling(feelingId);
    console.log(`Selected feeling: ${feelingId}`);
  };

  const handleSendChatRequest = () => {
    if (selectedFeeling) {
      console.log(`Sending chat request with topic: ${selectedTopic}, feeling: ${selectedFeeling}`);
      navigate('/chat-request-sent', { 
        state: { 
          topic: selectedTopic, 
          feeling: selectedFeeling 
        } 
      });
    }
  };

  const handleGoBack = () => {
    navigate('/topic-selection');
  };

  const getAnimationClass = () => {
    switch(animationPhase) {
      case 0: return 'animate-pulse';
      case 1: return 'animate-bounce';
      case 2: return 'animate-spin';
      case 3: return 'animate-ping';
      default: return 'animate-pulse';
    }
  };

  const getGradientPhase = () => {
    const gradients = [
      'from-blue-400/30 via-purple-400/20 to-pink-400/30',
      'from-green-400/30 via-blue-400/20 to-purple-400/30',
      'from-pink-400/30 via-purple-400/20 to-blue-400/30',
      'from-purple-400/30 via-pink-400/20 to-green-400/30'
    ];
    return gradients[animationPhase];
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br ${getGradientPhase()} opacity-20 ${getAnimationClass()}`}></div>
          <div className={`absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 opacity-30 animate-bounce delay-1000`}></div>
          <div className={`absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400/20 to-orange-400/20 opacity-25 animate-pulse delay-2000`}></div>
        </div>

        <div className="flex items-center mb-8 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="mr-4 hover:scale-110 transition-transform duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              How are you feeling?
            </h1>
            <p className="text-muted-foreground">Let us know how you're feeling today</p>
          </div>
        </div>

        {/* Enhanced Smooth Animation Element */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="relative">
            {/* Multiple layered animations for more soothing effect */}
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGradientPhase()} animate-pulse opacity-60`}></div>
            <div className="absolute inset-1 w-22 h-22 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 animate-ping opacity-50"></div>
            <div className="absolute inset-3 w-18 h-18 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 animate-bounce opacity-70"></div>
            <div className="absolute inset-6 w-12 h-12 rounded-full bg-gradient-to-br from-white/30 to-transparent animate-spin opacity-80" style={{animationDuration: '8s'}}></div>
            
            {/* Floating particles */}
            <div className="absolute -inset-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full bg-primary/30 animate-bounce opacity-60`}
                  style={{
                    left: `${Math.cos(i * 60 * Math.PI / 180) * 40 + 40}px`,
                    top: `${Math.sin(i * 60 * Math.PI / 180) * 40 + 40}px`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 mb-8 relative z-10">
          {feelingOptions.map((feeling, index) => (
            <Button
              key={feeling.id}
              variant="topic"
              size="topic"
              onClick={() => handleFeelingSelect(feeling.id)}
              className={`w-full justify-start text-left bg-gradient-to-br ${feeling.color} hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden ${
                selectedFeeling === feeling.id ? 'ring-2 ring-primary scale-[1.02] shadow-xl' : ''
              }`}
              style={{animationDelay: `${index * 200}ms`}}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="flex items-center space-x-4 w-full relative z-10">
                <div className="flex-shrink-0">
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300 animate-bounce" style={{animationDelay: `${index * 300}ms`}}>
                    {feeling.emoji}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-lg">{feeling.label}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex justify-center relative z-10">
          <Button
            size="lg"
            onClick={handleSendChatRequest}
            disabled={!selectedFeeling}
            className="w-full max-w-xs py-3 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Send className="mr-2 h-5 w-5 animate-pulse" />
            Send Chat Request
          </Button>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg backdrop-blur-sm relative z-10">
          <p className="text-sm text-muted-foreground text-center">
            Your feelings and conversation will remain completely anonymous and confidential.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FeelingSelectionPage;
