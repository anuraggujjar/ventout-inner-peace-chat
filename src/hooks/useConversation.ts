import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/message';

interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'voice';
  content: string | null;
  audio_path: string | null;
  duration_seconds: number | null;
  created_at: string;
}

const toMessage = (row: DbMessage, currentUserId: string, audioUrl?: string): Message => ({
  id: row.id,
  sender: row.sender_id === currentUserId ? 'me' : 'partner',
  senderId: row.sender_id,
  content: row.content ?? undefined,
  text: row.content ?? undefined,
  timestamp: new Date(row.created_at),
  createdAt: new Date(row.created_at),
  type: row.type,
  audioData: audioUrl,
  duration: row.duration_seconds ?? undefined,
  status: 'sent',
});

/**
 * Subscribes to a single conversation's messages via Postgres Realtime
 * and exposes helpers for sending text/voice messages.
 */
export function useConversation(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve signed URL for voice messages (private bucket)
  const resolveAudio = useCallback(async (path: string): Promise<string | undefined> => {
    const { data } = await supabase.storage.from('voice-notes').createSignedUrl(path, 60 * 60);
    return data?.signedUrl;
  }, []);

  const addMessageRow = useCallback(async (row: DbMessage, userId: string) => {
    const audioUrl = row.audio_path ? await resolveAudio(row.audio_path) : undefined;
    const nextMessage = toMessage(row, userId, audioUrl);

    setMessages((prev) => {
      if (prev.some((m) => m.id === nextMessage.id)) return prev;
      return [...prev, nextMessage].sort(
        (a, b) => (a.createdAt ?? a.timestamp).getTime() - (b.createdAt ?? b.timestamp).getTime()
      );
    });
  }, [resolveAudio]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      if (!conversationId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const { data: rows } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (cancelled) return;

      const mapped: Message[] = [];
      for (const row of rows ?? []) {
        const audioUrl = row.audio_path ? await resolveAudio(row.audio_path) : undefined;
        mapped.push(toMessage(row as DbMessage, user.id, audioUrl));
      }
      if (!cancelled) {
        setMessages((prev) => {
          const byId = new Map<string, Message>();
          [...mapped, ...prev].forEach((item) => byId.set(item.id, item));
          return Array.from(byId.values()).sort(
            (a, b) => (a.createdAt ?? a.timestamp).getTime() - (b.createdAt ?? b.timestamp).getTime()
          );
        });
        setLoading(false);
      }
    })();

    if (!conversationId) return () => { cancelled = true; };

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const row = payload.new as DbMessage;
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          await addMessageRow(row, user.id);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId, resolveAudio, addMessageRow]);

  const sendText = useCallback(async (text: string) => {
    if (!conversationId || !currentUserId || !text.trim()) return;
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      type: 'text',
      content: text.trim(),
    }).select('*').single();
    if (error) throw new Error(error.message);
    if (data) await addMessageRow(data as DbMessage, currentUserId);
  }, [conversationId, currentUserId, addMessageRow]);

  const sendVoice = useCallback(async (blob: Blob, durationSeconds: number) => {
    if (!conversationId || !currentUserId) return;
    const filename = `${crypto.randomUUID()}.webm`;
    const path = `${conversationId}/${filename}`;
    const { error: upErr } = await supabase.storage
      .from('voice-notes')
      .upload(path, blob, { contentType: blob.type || 'audio/webm' });
    if (upErr) throw new Error(upErr.message);

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      type: 'voice',
      audio_path: path,
      duration_seconds: Math.round(durationSeconds),
    }).select('*').single();
    if (error) throw new Error(error.message);
    if (data) await addMessageRow(data as DbMessage, currentUserId);
  }, [conversationId, currentUserId, addMessageRow]);

  return { messages, loading, sendText, sendVoice, currentUserId };
}
