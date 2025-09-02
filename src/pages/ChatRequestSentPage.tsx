
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Users, Heart } from 'lucide-react';

const ChatRequestSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dots, setDots] = useState('');
  const [connectionTime, setConnectionTime] = useState(0);
  
  const { topic, feeling } = location.state || {};

  useEffect(() => {
    // Animated dots for "Connecting" text
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Connection timer
    const timerInterval = setInterval(() => {
      setConnectionTime(prev => prev + 1);
    }, 1000);

    // Auto redirect to chat after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/chat', { 
        state: { 
          topic, 
          feeling,
          userName: 'You',
          listenerName: 'Sarah'
        } 
      });
    }, 5000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timerInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate, topic, feeling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 text-center relative overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/20 animate-bounce delay-1000"></div>
          <div className="absolute top-1/3 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/20 animate-ping delay-2000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Success icon with animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                <MessageCircle size={48} className="text-green-500 animate-bounce" />
              </div>
              <div className="absolute -inset-4 rounded-full border-2 border-green-500/30 animate-ping"></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chat Request Sent!
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Connecting you to a listener{dots}
          </p>

          {/* Connection status card */}
          <div className="bg-card p-8 rounded-2xl shadow-lg mb-8 border border-border/50 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Users size={16} className="text-primary" />
                </div>
                <div className="text-2xl">→</div>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-pulse delay-500">
                  <Heart size={16} className="text-accent" />
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold mb-4">We're finding the perfect listener for you</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Topic: {topic || 'General'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-200"></div>
                <span>Mood: {feeling || 'Not specified'}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>Connection time: {formatTime(connectionTime)}</span>
              </div>
            </div>
          </div>

          {/* Reassuring message */}
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground">
              We're connecting you with a real human who genuinely cares and will listen without judgment. 
              Your conversation will be completely anonymous and confidential.
            </p>
          </div>

          {/* Loading animation */}
          <div className="flex justify-center space-x-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="hover:scale-105 transition-transform duration-200"
          >
            Cancel Request
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ChatRequestSentPage;
