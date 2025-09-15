import { User, Headphones } from "lucide-react";

export interface Message {
  id: string;
  text: string;
  sender: "listener" | "talker";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isListener = message.sender === "listener";

  return (
    <div className={`flex items-start gap-3 ${isListener ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isListener 
          ? "bg-accent text-accent-foreground" 
          : "bg-primary/10 text-primary-foreground"
      }`}>
        {isListener ? (
          <Headphones className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-md ${
        isListener 
          ? "bg-accent text-accent-foreground rounded-2xl rounded-tr-md" 
          : "bg-card border border-border/50 rounded-2xl rounded-tl-md"
      } px-4 py-3`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-2 ${
          isListener ? "text-accent-foreground/70" : "text-muted-foreground"
        }`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};