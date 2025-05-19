
import React from 'react';
import { RefreshCcw } from 'lucide-react'; // Icon for refresh
import { Button } from '@/components/ui/button'; // Using shadcn button

interface QuoteCardProps {
  quote: string;
  author: string;
  onRefresh: () => void; // Placeholder for refresh functionality
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, author, onRefresh }) => {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg my-6 animate-fade-in">
      <blockquote className="text-lg italic text-foreground mb-4">
        "{quote}"
      </blockquote>
      <p className="text-right text-sm text-muted-foreground mb-4">- {author}</p>
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh quote">
          <RefreshCcw className="h-5 w-5 text-muted-foreground hover:text-primary" />
        </Button>
      </div>
    </div>
  );
};

export default QuoteCard;
