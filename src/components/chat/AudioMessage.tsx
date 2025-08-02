
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
    <div className={`flex items-center space-x-2 p-3 rounded-xl min-w-[200px] max-w-[240px] transition-all duration-300 ${
      isCurrentUser 
        ? 'bg-primary/5 border border-primary/10' 
        : 'bg-muted/50 border border-border/50'
    } ${isPlaying ? 'shadow-lg scale-[1.02] ring-1 ring-primary/30' : 'shadow-sm'}`}>
      <Button 
        onClick={togglePlayback}
        size="sm"
        variant={isCurrentUser ? "secondary" : "outline"}
        className={`rounded-full flex-shrink-0 w-8 h-8 p-0 transition-all duration-200 ${
          isCurrentUser ? 'hover:bg-primary/20' : 'hover:bg-primary/10'
        } ${isPlaying ? 'bg-primary text-primary-foreground scale-105' : ''}`}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Volume2 className={`w-3 h-3 transition-colors duration-200 ${
              isPlaying ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs font-medium transition-colors duration-200 ${
              isPlaying ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {isPlaying ? 'Playing' : 'Voice'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(displayDuration)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-200 rounded-full ${
              isCurrentUser ? 'bg-primary' : 'bg-primary/70'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
          {isPlaying && (
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse rounded-full" />
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground/70 font-mono">
            {formatTime(currentTime)}
          </span>
          <div className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
