
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, XCircle, ShieldAlert, Mic } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onSendVoiceMessage: (audioData: string, duration: number) => void;
  onEndChat: () => void;
  onReport: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

const MessageInput = ({ 
  message, 
  setMessage, 
  onSendMessage, 
  onSendVoiceMessage,
  onEndChat, 
  onReport, 
  connectionStatus 
}: MessageInputProps) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleVoiceMessage = (audioData: string, duration: number) => {
    onSendVoiceMessage(audioData, duration);
    setShowVoiceRecorder(false);
  };

  return (
    <>
      <div className="border-t border-border/50 p-4 bg-card">
        <div className="flex space-x-2 mb-4">
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={connectionStatus !== 'connected'}
            />
            <Button 
              onClick={() => setShowVoiceRecorder(true)}
              size="icon"
              variant="outline"
              disabled={connectionStatus !== 'connected'}
              className="hover:scale-105 transition-transform duration-200"
            >
              <Mic size={16} />
            </Button>
            <Button 
              onClick={onSendMessage}
              size="icon"
              disabled={!message.trim() || connectionStatus !== 'connected'}
              className="hover:scale-105 transition-transform duration-200"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center space-x-3">
          <Button variant="outline" size="sm" onClick={onEndChat} className="hover:scale-105 transition-transform duration-200">
            <XCircle className="mr-2 h-4 w-4" /> End Chat
          </Button>
          <Button variant="outline" size="sm" onClick={onReport} className="hover:scale-105 transition-transform duration-200">
            <ShieldAlert className="mr-2 h-4 w-4" /> Report
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="px-4 py-2 bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          This conversation is anonymous and confidential. You are chatting with a real person.
        </p>
      </div>

      <VoiceRecorder 
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSendVoiceMessage={handleVoiceMessage}
      />
    </>
  );
};

export default MessageInput;
