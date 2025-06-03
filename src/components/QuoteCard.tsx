
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Quote } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  author: string;
  onRefresh: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, author, onRefresh }) => {
  return (
    <Card className="w-full max-w-md mx-auto mb-8 shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <blockquote className="text-lg font-medium text-foreground mb-3 leading-relaxed">
              "{quote}"
            </blockquote>
            <div className="flex items-center justify-between">
              <cite className="text-sm text-muted-foreground font-medium">
                — {author}
              </cite>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="hover:scale-110 transition-transform duration-200"
                aria-label="Refresh quote"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
