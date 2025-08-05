import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Phone } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

type Step = 'phone' | 'otp';

export const PhoneOTPForm: React.FC = () => {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSendOTP = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      await authService.sendOTP({ phone: data.phone });
      setPhoneNumber(data.phone);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const authData = await authService.verifyOTP({
        phone: phoneNumber,
        code: otpValue,
      });
      
      await refreshUser();
      
      toast({
        title: "Verification successful",
        description: "Welcome to the platform!",
      });

      if (authData.user.role === 'listener') {
        navigate('/listener/home');
      } else {
        navigate('/home');
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      await authService.sendOTP({ phone: phoneNumber });
      setCountdown(60);
      setCanResend(false);
      setOtpValue('');
      
      toast({
        title: "OTP resent",
        description: "Please check your phone for the new verification code",
      });
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtpValue('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {step === 'otp' && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Phone className="h-5 w-5" />
          <CardTitle>
            {step === 'phone' ? 'Phone Verification' : 'Enter OTP'}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                {...phoneForm.register('phone')}
              />
              {phoneForm.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>
            
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium">{phoneNumber}</p>
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              onClick={handleVerifyOTP} 
              size="lg" 
              className="w-full" 
              disabled={isLoading || otpValue.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            
            <div className="text-center">
              {canResend ? (
                <Button 
                  variant="ghost" 
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend in {countdown}s
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};