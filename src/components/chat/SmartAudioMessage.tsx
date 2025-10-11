import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';

interface AudioMessageProps {
  audioData: string; // base64
  duration: number; // seconds
  isCurrentUser: boolean;
}

// Utility: format seconds as M:SS
const formatTime = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SmartAudioMessage = ({ audioData, duration, isCurrentUser }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [metaDuration, setMetaDuration] = useState<number | null>(null);
  const [unsupported, setUnsupported] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Build bytes once
  const bytes = useMemo(() => {
    try {
      const clean = (audioData || '').replace(/\s+/g, '');
      const bin = atob(clean);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return u8;
    } catch (e) {
      console.error('Base64 decode failed', e);
      return null;
    }
  }, [audioData]);

  // Decide best playable mime for this environment
  const chosenMime = useMemo(() => {
    if (!bytes) return null;
    const header = bytes.slice(0, 4);
    const looksWebM = header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3; // EBML
    const looksOgg = header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53; // 'OggS'

    const el = document.createElement('audio');
    const candidates: string[] = [];
    if (looksWebM) {
      candidates.push('audio/webm; codecs=opus', 'audio/webm');
    } else if (looksOgg) {
      candidates.push('audio/ogg; codecs=opus', 'audio/ogg');
    } else {
      candidates.push('audio/webm; codecs=opus', 'audio/webm', 'audio/ogg; codecs=opus', 'audio/ogg');
    }

    // Pick the first supported type
    const supported = candidates.find((t) => el.canPlayType(t) !== '');
    return supported || null;
  }, [bytes]);

  // Set up audio element and object URL
  useEffect(() => {
    // Cleanup previous
    if (objectUrlRef.current) {
      try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
      objectUrlRef.current = null;
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current = null;
    }

    if (!bytes) {
      setUnsupported('invalid_data');
      return;
    }

    // If no supported type on this platform, show friendly UI
    if (!chosenMime) {
      setUnsupported('not_supported');
      // Still prepare a blob for download
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      blobRef.current = blob;
      return;
    }

    setUnsupported(null);
    const blob = new Blob([bytes], { type: chosenMime });
    blobRef.current = blob;
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;

    const audio = new Audio(url);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.onloadedmetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) setMetaDuration(audio.duration);
    };
    audio.onerror = (e) => {
      console.error('Audio playback error:', e, (audio as any).error);
      // If this fails even though canPlayType said yes, mark unsupported for this device
      setUnsupported('play_failed');
      setIsPlaying(false);
    };

    return () => {
      try { audio.pause(); } catch {}
      if (objectUrlRef.current) {
        try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
        objectUrlRef.current = null;
      }
      audioRef.current = null;
    };
  }, [bytes, chosenMime]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || unsupported) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.ended || audio.currentTime >= (audio.duration || 0)) audio.currentTime = 0;
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    }
  };

  if (!audioData) {
    return <div className="text-destructive text-xs">Error: No audio data</div>;
  }

  const finalDuration = metaDuration || duration || 1;
  const progressPercentage = finalDuration > 0 ? (currentTime / finalDuration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg max-w-[160px] transition-all duration-300 border ring-1 ${
      isCurrentUser ? 'bg-primary/8 border-primary/30 ring-primary/20' : 'bg-muted/30 border-border/40 ring-border/20'
    }`}>
      <Button
        onClick={togglePlayback}
        size="sm"
        variant="ghost"
        disabled={!!unsupported}
        className={`rounded-full flex-shrink-0 w-6 h-6 p-0 transition-all duration-200 ${
          isPlaying ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/20'
        }`}
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-px" />}
      </Button>

      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div className="relative h-1 bg-muted/40 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-200 rounded-full ${
              isCurrentUser ? 'bg-primary' : 'bg-primary/70'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/* Timer display or unsupported message */}
        <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5 text-center">
          {unsupported ? (
            <span className="inline-flex items-center gap-1">
              Unsupported
              {blobRef.current ? (
                <a
                  href={objectUrlRef.current || URL.createObjectURL(blobRef.current)}
                  download={chosenMime?.includes('mp4') ? 'audio.mp4' : 'audio.webm'}
                  className="underline inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                </a>
              ) : null}
            </span>
          ) : (
            `${formatTime(currentTime)} / ${formatTime(finalDuration)}`
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartAudioMessage;
