
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-4 flex flex-col items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="self-start mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Chat History</h1>
        <div className="text-center text-muted-foreground">
          <p>This is where your chat history will be displayed.</p>
          <p>(Coming Soon)</p>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
