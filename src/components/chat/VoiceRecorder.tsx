import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (audioData: string, duration: number) => void;
}

const VoiceRecorder = ({ isOpen, onClose, onSendVoiceMessage }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !isRecording && !recordedAudio) {
      startRecording();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          // Use the duration that was set when stopping, not currentTime at this moment
          const recordingDuration = Math.max(duration, 1);
          console.log('Audio recording finished:', {
            duration: recordingDuration,
            finalDuration: duration,
            currentTime,
            audioDataLength: base64.length,
            type: 'voice'
          });
          // Auto-send the audio immediately after recording stops
          onSendVoiceMessage(base64, recordingDuration);
          handleClose();
        };
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setCurrentTime(0);
      
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          setDuration(newTime); // Keep duration in sync with recording time
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Store the current recording time before stopping
      const recordedDuration = currentTime;
      setDuration(recordedDuration);
      console.log('Stopping recording, duration:', recordedDuration, 'currentTime:', currentTime);
      
      // Stop the recorder (this will trigger onstop event)
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (recordedAudio && !isPlaying) {
      const audio = new Audio(`data:audio/webm;base64,${recordedAudio}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (recordedAudio && duration > 0) {
      onSendVoiceMessage(recordedAudio, duration);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsRecording(false);
    setIsPlaying(false);
    setRecordedAudio(null);
    setDuration(0);
    setCurrentTime(0);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setDuration(0);
    setCurrentTime(0);
  };

  if (!isOpen) return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono text-muted-foreground">
            {formatTime(currentTime)}
          </span>
        </div>
      )}
      
      {/* Controls */}
      {!recordedAudio ? (
        <>
          {isRecording ? (
            <Button onClick={stopRecording} variant="destructive" size="icon" className="rounded-full">
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={startRecording} size="icon" className="rounded-full">
              <Mic className="w-4 h-4" />
            </Button>
          )}
        </>
      ) : (
        <>
          <span className={`text-sm font-mono transition-colors duration-200 ${
            isPlaying ? 'text-primary font-medium' : 'text-muted-foreground'
          }`}>
            {isPlaying ? 'Playing...' : formatTime(duration)}
          </span>
          <Button 
            onClick={playRecording} 
            variant="outline" 
            size="icon" 
            className={`rounded-full transition-all duration-200 ${
              isPlaying ? 'bg-primary/10 border-primary/30 animate-pulse' : ''
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={resetRecording} variant="outline" size="icon" className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
          <Button onClick={handleSend} size="icon" className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {!isRecording && !recordedAudio && (
        <Button onClick={handleClose} variant="ghost" size="icon">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default VoiceRecorder;