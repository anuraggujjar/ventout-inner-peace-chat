import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingRequest {
  id: string;
  talker_id: string;
  topic: string | null;
  feeling: string | null;
  created_at: string;
  talker_name?: string;
}

const TalkerListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const homePath = user?.role === 'listener' ? '/listener/home' : '/';

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('chat_requests')
      .select('id, talker_id, topic, feeling, created_at')
      .eq('status', 'pending')
      .is('listener_id', null)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }

    // Enrich with talker display names
    const ids = Array.from(new Set((data ?? []).map(r => r.talker_id)));
    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('profiles').select('id, display_name').in('id', ids);
      names = Object.fromEntries((profiles ?? []).map(p => [p.id, p.display_name ?? 'Anonymous']));
    }
    setRequests((data ?? []).map(r => ({ ...r, talker_name: names[r.talker_id] ?? 'Anonymous' })));
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('chat_requests:pending')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_requests' },
        () => { fetchRequests(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (req: PendingRequest) => {
    if (!user) return;
    // Step 1: atomically CLAIM the request (set listener_id) but keep status='pending'
    // so the talker's realtime UPDATE handler doesn't fire before the conversation exists.
    const { data: claimed, error } = await supabase
      .from('chat_requests')
      .update({ listener_id: user.id })
      .eq('id', req.id)
      .eq('status', 'pending')
      .is('listener_id', null)
      .select('id')
      .maybeSingle();
    if (error || !claimed) {
      toast({ title: 'Already taken', description: 'Someone else accepted this chat first.', variant: 'destructive' });
      fetchRequests();
      return;
    }
    // Step 2: create the conversation row first.
    const { data: convo, error: cErr } = await supabase
      .from('conversations')
      .insert({ request_id: req.id, talker_id: req.talker_id, listener_id: user.id })
      .select('id')
      .single();
    if (cErr || !convo) {
      // Rollback claim so another listener can pick it up.
      await supabase.from('chat_requests').update({ listener_id: null }).eq('id', req.id);
      toast({ title: 'Error', description: cErr?.message ?? 'Could not start conversation', variant: 'destructive' });
      return;
    }
    // Step 3: NOW attach the chat room id and flip status to 'accepted' — this is the signal the talker subscribes to.
    const { error: aErr } = await supabase
      .from('chat_requests')
      .update({ status: 'accepted', conversation_id: convo.id })
      .eq('id', req.id);
    if (aErr) {
      toast({ title: 'Error', description: aErr.message, variant: 'destructive' });
      return;
    }
    navigate(`/chat?cid=${convo.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex flex-col gap-3 p-4">
          <h1 className="text-xl font-semibold text-primary">Plaro</h1>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending Chat Requests</span>
            <Badge variant="outline" className="text-sm bg-primary/10 text-primary border-primary/40 font-medium">
              {requests.length} waiting
            </Badge>
          </div>
        </div>
      </header>

      <main className="p-4 pb-20">
        <div className="mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate(homePath)}
            className="text-primary hover:text-primary-foreground hover:bg-primary border-primary/40">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/20 shadow-sm">
          <h2 className="font-medium text-primary mb-2">Ready to Help?</h2>
          <p className="text-sm text-foreground/70">
            Choose someone who needs support. Your compassion can make a difference.
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading…</div>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <Card key={req.id} className="p-6 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{req.talker_name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Wants to talk about <span className="font-medium text-foreground">{req.topic || 'general'}</span>
                      {req.feeling ? <> — feeling <span className="font-medium text-foreground">{req.feeling}</span></> : null}
                    </p>
                    <div className="flex items-center justify-end">
                      <Button onClick={() => handleAccept(req)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No one needs help right now</h3>
              <p className="text-muted-foreground text-sm">New requests will appear here automatically.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TalkerListPage;
