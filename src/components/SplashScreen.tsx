import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 200);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 800); // Extra delay for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-in-out ${
      isAnimating 
        ? 'bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-100' 
        : 'bg-background opacity-0'
    }`}>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary/20 rounded-full animate-bounce ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center relative z-10">
        <div className={`transform transition-all duration-1000 ease-out ${
          showContent 
            ? 'translate-y-0 scale-100 opacity-100' 
            : 'translate-y-8 scale-75 opacity-0'
        }`}>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary/80 via-secondary/80 to-accent/80 bg-clip-text text-transparent animate-pulse">
            VentOut
          </h1>
          
          {/* Decorative elements */}
          <div className="flex justify-center mt-4 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 bg-primary rounded-full animate-bounce ${
                  showContent ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>

        <div className={`mt-6 transform transition-all duration-1000 delay-500 ease-out ${
          showContent 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}>
          <p className="text-xl text-muted-foreground font-medium">
            Your safe space to be heard
          </p>
          
          {/* Loading bar */}
          <div className="mt-8 w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-transform duration-2000 ease-out ${
              showContent ? 'translate-x-0' : '-translate-x-full'
            }`} />
          </div>
        </div>

        {/* Ripple effect */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          showContent ? 'animate-ping' : ''
        }`}>
          <div className="w-48 h-48 border border-primary/20 rounded-full" />
        </div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          showContent ? 'animate-ping' : ''
        }`} style={{ animationDelay: '0.5s' }}>
          <div className="w-64 h-64 border border-secondary/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};