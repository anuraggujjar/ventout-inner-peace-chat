import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Extra delay for fade out animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary animate-fade-in animate-scale-in">
          VentOut
        </h1>
        <p className="text-xl text-muted-foreground mt-4 animate-fade-in delay-300">
          Your safe space to be heard
        </p>
        <div className="mt-8 animate-pulse">
          <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};