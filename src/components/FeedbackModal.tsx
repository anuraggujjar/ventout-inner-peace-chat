
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const emojiRatings = [
    { emoji: '😢', label: 'Very Poor', value: 1 },
    { emoji: '😕', label: 'Poor', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😊', label: 'Good', value: 4 },
    { emoji: '🤗', label: 'Excellent', value: 5 },
  ];

  const handleSubmit = () => {
    if (selectedRating === null) {
      toast({
        title: "Please select a rating",
        description: "Your feedback helps us improve.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(selectedRating, feedback);
    
    // Reset form
    setSelectedRating(null);
    setFeedback('');
    
    toast({
      title: "Thank you for your feedback!",
      description: "Your experience matters to us.",
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">How was your experience?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emoji Rating */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Rate your conversation</p>
            <div className="flex justify-center space-x-3">
              {emojiRatings.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  className={`text-3xl p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                    selectedRating === rating.value 
                      ? 'bg-primary/20 scale-110 shadow-lg' 
                      : 'hover:bg-muted'
                  }`}
                  title={rating.label}
                >
                  {rating.emoji}
                </button>
              ))}
            </div>
            {selectedRating && (
              <p className="text-center text-sm text-muted-foreground">
                {emojiRatings.find(r => r.value === selectedRating)?.label}
              </p>
            )}
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tell us more about your experience (optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well? What could be improved?"
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackModal;
