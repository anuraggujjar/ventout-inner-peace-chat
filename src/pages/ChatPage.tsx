import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useConversation } from '@/hooks/useConversation';
import { supabase } from '@/integrations/supabase/app-client';
import { sanitizeInput } from '@/utils/privacy';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const conversationId = params.get('cid');
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, sendText, sendVoice } = useConversation(conversationId);
  const [message, setMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [ended, setEnded] = useState(false);

  const userRole: 'listener' | 'talker' = user?.role || 'talker';
  const connectionStatus: 'connecting' | 'connected' | 'disconnected' =
    !conversationId ? 'disconnected' : loading ? 'connecting' : ended ? 'disconnected' : 'connected';

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Watch for conversation end (ended_at set by other party)
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}`,
      }, (payload) => {
        if ((payload.new as { ended_at: string | null }).ended_at) {
          setEnded(true);
          toast({ title: 'Chat ended', description: 'The conversation has ended.' });
          setShowFeedback(true);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, toast]);

  const handleSendMessage = async () => {
    if (!message.trim() || connectionStatus !== 'connected') return;
    try { await sendText(sanitizeInput(message)); setMessage(''); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleSendVoiceMessage = async (audioDataB64: string, duration: number) => {
    if (connectionStatus !== 'connected') return;
    try {
      const bin = atob(audioDataB64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const blob = new Blob([u8], { type: 'audio/webm' });
      await sendVoice(blob, duration);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleEndChat = async () => {
    if (conversationId && !ended) {
      await supabase.from('conversations').update({ ended_at: new Date().toISOString() }).eq('id', conversationId);
      setEnded(true);
    }
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async (rating: number, feedbackText: string) => {
    if (conversationId && user) {
      await supabase.from('feedback').insert({
        conversation_id: conversationId,
        from_user: user.id,
        rating,
        comment: feedbackText || null,
      });
    }
    toast({ title: 'Chat Ended', description: 'Thank you for your feedback.' });
    navigate(userRole === 'listener' ? '/listener/home' : '/');
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    navigate(userRole === 'listener' ? '/listener/home' : '/');
  };

  if (!conversationId) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <Card className="p-8 max-w-md w-full text-center space-y-6">
            <h2 className="text-2xl font-semibold">No active chat</h2>
            <p className="text-muted-foreground">Start or accept a chat request to begin.</p>
            <Button onClick={() => navigate(userRole === 'listener' ? '/listener/home' : '/')}>Go home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading conversation…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <ChatHeader userRole={userRole} connectionStatus={connectionStatus} sessionId={conversationId} />
        <MessageList
          messages={messages}
          userRole={userRole}
          partnerTyping={false}
          messagesEndRef={messagesEndRef}
          user={user}
        />
        <MessageInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onSendVoiceMessage={handleSendVoiceMessage}
          onEndChat={handleEndChat}
          onReport={() => toast({ title: 'Report submitted', description: 'Thank you. We take all reports seriously.' })}
          connectionStatus={connectionStatus}
        />
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={handleFeedbackClose} onSubmit={handleFeedbackSubmit} />
    </Layout>
  );
};

export default ChatPage;
