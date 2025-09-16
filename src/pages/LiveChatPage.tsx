import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSocketContext } from "@/contexts/SocketContext";
import { ChatMessage } from "@/components/ChatMessage";

const LiveChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    messages, 
    partner, 
    currentRoom, 
    sendTextMessage, 
    startTyping, 
    stopTyping, 
    leaveChat, 
    partnerTyping,
    isConnected 
  } = useSocketContext();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no active chat
  useEffect(() => {
    if (!currentRoom && !partner) {
      navigate('/talker-list');
    }
  }, [currentRoom, partner, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    sendTextMessage(newMessage);
    setNewMessage("");
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = () => {
    leaveChat();
    toast({
      title: "Session Ended",
      description: "Thank you for providing support. The conversation has been securely ended.",
    });
    navigate("/talker-list");
  };

  if (!partner || !currentRoom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Active Chat</h2>
          <p className="text-muted-foreground mb-4">Please select someone to chat with.</p>
          <Button onClick={() => navigate("/talker-list")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Back to Talker List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/talker-list")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{partner.displayName}</h1>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndSession}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors px-4 py-2"
            >
              End Session
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={{
                id: message.id,
                text: message.content,
                sender: message.sender as "listener" | "talker",
                timestamp: message.timestamp
              }} 
            />
          ))}
          
          {partnerTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="border-t border-border bg-card/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="min-h-[48px] rounded-2xl border-border/50 bg-background px-4 py-3 text-sm resize-none focus:border-accent transition-colors"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 py-3 h-12 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveChatPage;