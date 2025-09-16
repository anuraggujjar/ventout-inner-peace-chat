import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Clock, User } from "lucide-react";
import { useEffect } from "react";
import { useSocketContext } from "@/contexts/SocketContext";

const TalkerListPage = () => {
  const navigate = useNavigate();
  const { availableTalkers, isConnected, requestChat } = useSocketContext();

  useEffect(() => {
    // Start looking for talkers when component mounts
    if (isConnected) {
      // This will trigger the socket to send available talkers
    }
  }, [isConnected]);

  const handleConnect = (talkerId: string) => {
    requestChat(talkerId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-primary">VentOut</h1>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Conversations</span>
            <Badge variant="outline" className="text-sm bg-primary/10 text-primary border-primary/40 font-medium">
              {availableTalkers.length} waiting
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/listener/home")}
            className="text-primary hover:text-primary-foreground hover:bg-primary border-primary/40"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/20 shadow-sm">
          <h2 className="font-medium text-primary mb-2">Ready to Help?</h2>
          <p className="text-sm text-foreground/70">
            Choose someone who needs support. Your compassion can make a difference.
          </p>
        </div>

        {/* Talkers Grid */}
        <div className="space-y-4">
          {availableTalkers.length > 0 ? (
            availableTalkers.map((talker) => (
              <Card key={talker.id} className="p-6 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{talker.displayName}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${talker.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {talker.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Looking for someone to talk to...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {talker.role}
                      </div>
                      
                      <Button
                        onClick={() => handleConnect(talker.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors duration-200"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No one needs help right now</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Check back later or try refreshing the page.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/50"
              >
                Refresh
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TalkerListPage;