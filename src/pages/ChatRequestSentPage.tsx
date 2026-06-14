import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Users, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ChatRequestSentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [dots, setDots] = useState('');
  const [connectionTime, setConnectionTime] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
  const createdRef = useRef(false);

  const { topic, feeling } = location.state || {};

  // Create the chat request on mount (once)
  useEffect(() => {
    if (!user || createdRef.current) return;
    createdRef.current = true;
    (async () => {
      const { data, error } = await supabase
        .from('chat_requests')
        .insert({ talker_id: user.id, topic: topic ?? null, feeling: feeling ?? null })
        .select('id')
        .single();
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        navigate('/topic-selection');
        return;
      }
      setRequestId(data.id);
    })();
  }, [user, topic, feeling, navigate, toast]);

  // Subscribe to my request being accepted → fetch conversation → navigate.
  // We listen on TWO signals so a missed/late event can't strand the talker:
  //   1) chat_requests UPDATE with status='accepted'
  //   2) conversations INSERT with request_id=<ours>
  // Plus a one-shot check on mount in case the accept happened first.
  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const goToConversation = async () => {
      if (cancelled) return;
      const { data: convo } = await supabase
        .from('conversations')
        .select('id')
        .eq('request_id', requestId)
        .maybeSingle();
      if (convo && !cancelled) navigate(`/chat?cid=${convo.id}`);
    };

    // One-shot: was it already accepted before we subscribed?
    (async () => {
      const { data: req } = await supabase
        .from('chat_requests')
        .select('status')
        .eq('id', requestId)
        .maybeSingle();
      if (req?.status === 'accepted') await goToConversation();
    })();

    const reqChannel = supabase
      .channel(`chat_request:${requestId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'chat_requests', filter: `id=eq.${requestId}`,
      }, async (payload) => {
        const row = payload.new as { status: string };
        if (row.status === 'accepted') await goToConversation();
      })
      .subscribe();

    const convoChannel = supabase
      .channel(`conversation_for:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'conversations', filter: `request_id=eq.${requestId}`,
      }, (payload) => {
        const row = payload.new as { id: string };
        if (row?.id && !cancelled) navigate(`/chat?cid=${row.id}`);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(reqChannel);
      supabase.removeChannel(convoChannel);
    };
  }, [requestId, navigate]);

  // Dots + timer
  useEffect(() => {
    const d = setInterval(() => setDots(p => (p.length >= 3 ? '' : p + '.')), 500);
    const t = setInterval(() => setConnectionTime(p => p + 1), 1000);
    return () => { clearInterval(d); clearInterval(t); };
  }, []);

  const handleCancelRequest = async () => {
    if (requestId) {
      await supabase.from('chat_requests').update({ status: 'cancelled' }).eq('id', requestId);
    }
    navigate('/topic-selection');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 text-center min-h-screen flex flex-col justify-center">
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
        <p className="text-xl text-muted-foreground mb-8">Connecting you to a listener{dots}</p>

        <div className="bg-card p-8 rounded-2xl shadow-lg mb-8 border border-border/50">
          <div className="flex justify-center mb-6 items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Users size={16} className="text-primary" />
            </div>
            <div className="text-2xl">→</div>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
              <Heart size={16} className="text-accent" />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-4">We're finding the perfect listener for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Topic: {topic || 'General'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
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

        <Button onClick={handleCancelRequest} variant="outline">Cancel Request</Button>
      </div>
    </Layout>
  );
};

export default ChatRequestSentPage;
