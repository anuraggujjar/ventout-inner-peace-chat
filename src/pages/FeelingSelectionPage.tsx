
import React, { useState } from 'react';
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
  const selectedTopic = location.state?.topic;

  const handleFeelingSelect = (feelingId: string) => {
    setSelectedFeeling(feelingId);
    console.log(`Selected feeling: ${feelingId}`);
  };

  const handleSendChatRequest = () => {
    if (selectedFeeling) {
      console.log(`Sending chat request with topic: ${selectedTopic}, feeling: ${selectedFeeling}`);
      navigate('/chat', { 
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">How are you feeling?</h1>
            <p className="text-muted-foreground">Let us know how you're feeling today</p>
          </div>
        </div>

        {/* Smooth Animation Element */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 animate-ping opacity-75"></div>
            <div className="absolute inset-2 w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 animate-bounce"></div>
          </div>
        </div>

        <div className="grid gap-4 mb-8">
          {feelingOptions.map((feeling) => (
            <Button
              key={feeling.id}
              variant="topic"
              size="topic"
              onClick={() => handleFeelingSelect(feeling.id)}
              className={`w-full justify-start text-left bg-gradient-to-br ${feeling.color} hover:scale-[1.02] transition-all duration-300 group ${
                selectedFeeling === feeling.id ? 'ring-2 ring-primary scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center space-x-4 w-full">
                <div className="flex-shrink-0">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
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

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSendChatRequest}
            disabled={!selectedFeeling}
            className="w-full max-w-xs py-3 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="mr-2 h-5 w-5" />
            Send Chat Request
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Your feelings and conversation will remain completely anonymous and confidential.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FeelingSelectionPage;
