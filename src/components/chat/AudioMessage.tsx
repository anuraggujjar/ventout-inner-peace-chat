
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessageProps {
  audioData: string;
  duration: number;
  isCurrentUser: boolean;
}

const AudioMessage = ({ audioData, duration, isCurrentUser }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log('AudioMessage rendering with props:', { 
    audioDataLength: audioData?.length, 
    duration, 
    isCurrentUser 
  });

  const togglePlayback = () => {
    if (!audioRef.current) {
      const audio = new Audio(`data:audio/webm;base64,${audioData}`);
      audioRef.current = audio;
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (duration > 0 ? (currentTime / duration) : 0) * 100;
  const displayDuration = duration > 0 ? duration : 1; // Use minimum 1 second for display

  // Add safety check but be more lenient
  if (!audioData) {
    console.error('AudioMessage: No audio data provided');
    return <div className="text-red-500 text-sm">Error: No audio data</div>;
  }

  if (duration <= 0) {
    console.warn('AudioMessage: Invalid duration, using 1 second default', { duration });
    // Use 1 second as fallback instead of rejecting
  }

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg min-w-[160px] max-w-[180px] transition-all duration-300 ${
      isCurrentUser 
        ? 'bg-primary/5 border border-primary/10' 
        : 'bg-muted/40 border border-border/30'
    } ${isPlaying ? 'shadow-md scale-[1.01] ring-1 ring-primary/20' : 'shadow-sm'}`}>
      <Button 
        onClick={togglePlayback}
        size="sm"
        variant="ghost"
        className={`rounded-full flex-shrink-0 w-6 h-6 p-0 transition-all duration-200 ${
          isPlaying ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-2.5 h-2.5" />
        ) : (
          <Play className="w-2.5 h-2.5 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div className="relative h-1 bg-muted/50 rounded-full overflow-hidden mb-1">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-200 rounded-full ${
              isCurrentUser ? 'bg-primary' : 'bg-primary/60'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground/80 font-mono">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground/60 font-mono">
            {formatTime(displayDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
