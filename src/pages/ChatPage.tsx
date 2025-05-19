
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Video, ShieldAlert, XCircle, MessageCircleDashed } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageCircleDashed size={64} className="text-muted-foreground mb-6" />
        <h1 className="text-2xl font-semibold mb-4">Connecting you to a listener...</h1>
        <p className="text-muted-foreground mb-6">
          This is a placeholder for the anonymous chat room. Real-time chat functionality will be implemented soon.
        </p>
        
        <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md mb-8">
          <h2 className="text-lg font-medium mb-4 text-left">Chat Interface Placeholder</h2>
          <div className="h-40 bg-background rounded-lg flex items-center justify-center text-muted-foreground mb-4">
            Chat messages will appear here.
          </div>
          <div className="flex justify-between items-center gap-2">
             <Button variant="outline" size="sm" className="flex-1">
              <XCircle className="mr-2 h-4 w-4" /> End Chat
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <ShieldAlert className="mr-2 h-4 w-4" /> Report
            </Button>
          </div>
           <div className="mt-4 p-3 bg-accent/20 text-accent-foreground rounded-lg text-sm flex items-center justify-center">
            <Video size={18} className="mr-2" /> Video Call - Coming Soon!
          </div>
        </div>

        <Button onClick={() => navigate('/')} variant="ghost">
          Back to Home
        </Button>
      </div>
    </Layout>
  );
};

export default ChatPage;
