
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Pause, Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
          setRecordedAudio(base64);
        };
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setCurrentTime(0);
      
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(currentTime);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Voice Message</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Recording Animation */}
          <div className={`rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording ? 'w-12 h-12 bg-red-500 animate-pulse' : 'w-24 h-24 bg-primary'
          }`}>
            <Mic className={`text-white ${isRecording ? 'w-5 h-5' : 'w-10 h-10'}`} />
          </div>
          
          {/* Timer */}
          <div className="text-2xl font-mono font-bold">
            {formatTime(isRecording ? currentTime : duration)}
          </div>
          
          {/* Controls */}
          <div className="flex space-x-4">
            {!recordedAudio ? (
              <>
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg" className="rounded-full">
                    <Mic className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full">
                    <Square className="w-5 h-5" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={playRecording} variant="outline" size="lg" className="rounded-full">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button onClick={resetRecording} variant="outline" size="lg" className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
                <Button onClick={handleSend} size="lg" className="rounded-full">
                  <Send className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
          
          {recordedAudio && (
            <p className="text-sm text-muted-foreground text-center">
              Preview your recording and tap send to share it
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecorder;
