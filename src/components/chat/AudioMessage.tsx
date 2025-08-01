
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
    <div className={`flex items-center space-x-3 p-4 rounded-lg min-w-[280px] max-w-[350px] transition-all duration-300 border ${
      isCurrentUser 
        ? 'bg-primary/10 border-primary/20' 
        : 'bg-muted/80 border-border'
    } ${isPlaying ? 'shadow-md scale-[1.02] ring-2 ring-primary/20' : ''}`}>
      <Button 
        onClick={togglePlayback}
        size="icon"
        variant={isCurrentUser ? "secondary" : "outline"}
        className={`rounded-full flex-shrink-0 w-12 h-12 transition-all duration-200 ${
          isCurrentUser ? 'hover:bg-primary/30' : 'hover:bg-primary/10'
        } ${isPlaying ? 'bg-primary text-primary-foreground animate-pulse scale-110' : ''}`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <Volume2 className={`w-4 h-4 transition-colors duration-200 ${
            isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground'
          }`} />
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isPlaying ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {isPlaying ? 'Playing...' : 'Voice message'}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-200 rounded-full ${
              isCurrentUser ? 'bg-primary' : 'bg-primary/80'
            } ${isPlaying ? 'shadow-sm' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
          {isPlaying && (
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse rounded-full" />
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(displayDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
