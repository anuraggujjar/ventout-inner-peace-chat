
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
  },
  {
    id: 'not-ok',
    label: 'Not ok',
    emoji: '😔',
  },
  {
    id: 'dont-know',
    label: "Don't know",
    emoji: '🤷‍♀️',
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              How are you feeling?
            </h1>
            <p className="text-muted-foreground">Let us know how you're feeling today</p>
          </div>
        </div>

        <div className="grid gap-4 mb-8">
          {feelingOptions.map((feeling) => (
            <Button
              key={feeling.id}
              variant="outline"
              onClick={() => handleFeelingSelect(feeling.id)}
              className={`w-full justify-start text-left p-6 h-auto border-2 transition-all duration-200 ${
                selectedFeeling === feeling.id 
                  ? 'border-foreground bg-muted' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
            >
              <div className="flex items-center space-x-4 w-full">
                <div className="flex-shrink-0">
                  <span className="text-3xl">
                    {feeling.emoji}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-lg text-foreground">{feeling.label}</div>
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
            className="w-full max-w-xs py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="mr-2 h-5 w-5" />
            Send Chat Request
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
          <p className="text-sm text-muted-foreground text-center">
            Your feelings and conversation will remain completely anonymous and confidential.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FeelingSelectionPage;
