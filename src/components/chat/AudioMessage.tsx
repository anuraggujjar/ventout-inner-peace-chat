
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

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Add safety check
  if (!audioData || duration <= 0) {
    console.error('AudioMessage: Invalid props', { audioData: !!audioData, duration });
    return <div className="text-red-500 text-sm">Error: Invalid audio data</div>;
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg min-w-[200px] transition-all duration-300 ${
      isCurrentUser ? 'bg-primary/10' : 'bg-muted/50'
    } ${isPlaying ? 'shadow-md scale-[1.02]' : ''}`}>
      <Button 
        onClick={togglePlayback}
        size="icon"
        variant="ghost"
        className={`rounded-full flex-shrink-0 transition-all duration-200 ${
          isCurrentUser ? 'hover:bg-primary/20' : 'hover:bg-muted'
        } ${isPlaying ? 'bg-primary/20 animate-pulse' : ''}`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <Volume2 className={`w-3 h-3 transition-colors duration-200 ${
            isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground'
          }`} />
          <span className={`text-xs transition-colors duration-200 ${
            isPlaying ? 'text-primary font-medium' : 'text-muted-foreground'
          }`}>
            {isPlaying ? 'Playing...' : 'Voice message'}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-200 ${
              isCurrentUser ? 'bg-primary' : 'bg-primary/60'
            } ${isPlaying ? 'shadow-sm' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
          {isPlaying && (
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
