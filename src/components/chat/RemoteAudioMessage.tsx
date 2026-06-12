import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface Props {
  url?: string;
  duration: number;
  isCurrentUser: boolean;
}

const formatTime = (s: number) => {
  const t = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`;
};

const RemoteAudioMessage = ({ url, duration, isCurrentUser }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [metaDuration, setMetaDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.preload = 'metadata';
    audioRef.current = audio;
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.onloadedmetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        setMetaDuration(audio.duration);
      }
    };
    return () => { try { audio.pause(); } catch {} ; audioRef.current = null; };
  }, [url]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); }
    else { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }
  };

  const finalDuration = metaDuration || duration || 1;
  const progress = finalDuration > 0 ? (currentTime / finalDuration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg max-w-[180px] border ring-1 ${
      isCurrentUser ? 'bg-primary/8 border-primary/30 ring-primary/20' : 'bg-muted/30 border-border/40 ring-border/20'
    }`}>
      <Button
        onClick={toggle}
        size="sm"
        variant="ghost"
        disabled={!url}
        className={`rounded-full flex-shrink-0 w-6 h-6 p-0 ${isPlaying ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/20'}`}
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-px" />}
      </Button>
      <div className="flex-1 min-w-0">
        <div className="relative h-1 bg-muted/40 rounded-full overflow-hidden">
          <div className={`absolute left-0 top-0 h-full rounded-full ${isCurrentUser ? 'bg-primary' : 'bg-primary/70'}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5 text-center">
          {formatTime(currentTime)} / {formatTime(finalDuration)}
        </div>
      </div>
    </div>
  );
};

export default RemoteAudioMessage;
