import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChatSession {
  id: string;
  topic: string;
  feeling: string;
  startTime: Date;
  endedAt?: Date | null;
  partnerName: string;
  messageCount: number;
}

const HistoryPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    (async () => {
      const { data: convos, error } = await supabase
        .from('conversations')
        .select('id, talker_id, listener_id, started_at, ended_at, request_id, chat_requests(topic, feeling)')
        .or(`talker_id.eq.${user.id},listener_id.eq.${user.id}`)
        .order('started_at', { ascending: false });
      if (error) {
        toast({ title: 'Error', description: 'Could not load history.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const partnerIds = (convos ?? []).map(c => c.talker_id === user.id ? c.listener_id : c.talker_id);
      const uniq = Array.from(new Set(partnerIds));
      const { data: profiles } = uniq.length
        ? await supabase.from('profiles').select('id, display_name').in('id', uniq)
        : { data: [] as { id: string; display_name: string | null }[] };
      const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.display_name ?? 'Anonymous']));

      // Message counts
      const ids = (convos ?? []).map(c => c.id);
      const counts: Record<string, number> = {};
      if (ids.length) {
        const { data: msgRows } = await supabase
          .from('messages').select('conversation_id').in('conversation_id', ids);
        (msgRows ?? []).forEach(m => { counts[m.conversation_id] = (counts[m.conversation_id] ?? 0) + 1; });
      }

      setHistory((convos ?? []).map(c => {
        const partner = c.talker_id === user.id ? c.listener_id : c.talker_id;
        const cr = (c as any).chat_requests;
        return {
          id: c.id,
          topic: cr?.topic ?? 'general',
          feeling: cr?.feeling ?? 'ok',
          startTime: new Date(c.started_at),
          endedAt: c.ended_at ? new Date(c.ended_at) : null,
          partnerName: nameMap[partner] ?? 'Anonymous',
          messageCount: counts[c.id] ?? 0,
        };
      }));
      setIsLoading(false);
    })();
  }, [user, toast]);

  const topicLabel = (t: string) => ({
    general: 'General Chat', relationships: 'Relationships', 'work-stress': 'Work Stress',
    family: 'Family Issues', 'married-life': 'Married Life', lgbtq: 'LGBTQ Identity',
    loneliness: 'Loneliness & Depression',
  } as Record<string, string>)[t] || t;

  const feelingEmoji = (f: string) => ({ ok: '😊', 'not-ok': '😔', 'dont-know': '🤷‍♀️' } as Record<string, string>)[f] || '😐';

  const formatDate = (date: Date) => {
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (start: Date, end?: Date | null) => {
    if (!end) return 'In progress';
    const mins = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(user?.role === 'listener' ? '/listener/home' : '/')} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Chat History</h1>
            <p className="text-muted-foreground">Your previous conversations</p>
          </div>
        </div>

        {isLoading ? (
          <Card><CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold">Loading your chat history…</h3>
          </CardContent></Card>
        ) : history.length === 0 ? (
          <Card><CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chat history yet</h3>
            <p className="text-muted-foreground mb-4">Start your first conversation to see it here.</p>
            <Button onClick={() => navigate('/topic-selection')}>Start New Chat</Button>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {history.map((s) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{topicLabel(s.topic)}</span>
                    <span className="text-xl">{feelingEmoji(s.feeling)}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1"><Clock className="h-3 w-3" /><span>{formatDate(s.startTime)}</span></span>
                    <span className="flex items-center space-x-1"><User className="h-3 w-3" /><span>with {s.partnerName}</span></span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{formatDuration(s.startTime, s.endedAt)}</Badge>
                      <Badge variant="outline">{s.messageCount} messages</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
