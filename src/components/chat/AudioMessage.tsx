
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
      console.log('Creating audio element for playback, audioData length:', audioData.length);
      
      try {
        // Use data URL directly instead of blob URL to avoid security issues
        const dataUrl = `data:audio/webm;base64,${audioData}`;
        
        console.log('Creating audio with data URL');
        
        const audio = new Audio(dataUrl);
        audioRef.current = audio;
        
        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };
        
        audio.onended = () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
          setCurrentTime(0);
        };
        
        audio.onloadedmetadata = () => {
          console.log('Audio metadata loaded, duration:', audio.duration);
        };
        
        audio.onerror = (error) => {
          console.error('Audio playback error:', error, audio.error);
          setIsPlaying(false);
        };
      } catch (error) {
        console.error('Error creating audio:', error);
        return;
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
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
    <div className={`flex items-center space-x-2 p-2 rounded-lg max-w-[140px] transition-all duration-300 border ring-1 ${
      isCurrentUser 
        ? 'bg-primary/8 border-primary/30 ring-primary/20' 
        : 'bg-muted/30 border-border/40 ring-border/20'
    }`}>
      <Button 
        onClick={togglePlayback}
        size="sm"
        variant="ghost"
        className={`rounded-full flex-shrink-0 w-6 h-6 p-0 transition-all duration-200 ${
          isPlaying ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/20'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3 ml-px" />
        )}
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
        
        {/* Timer display */}
        <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5 text-center">
          {formatTime(currentTime)} / {formatTime(displayDuration)}
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
