import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone } from 'lucide-react';

export const PhoneOTPForm: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Phone sign-in isn't enabled yet. Please continue with email or Google for now.
        </p>
      </CardContent>
    </Card>
  );
};
