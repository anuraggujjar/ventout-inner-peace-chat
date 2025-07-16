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
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-in-out ${
      isAnimating 
        ? 'bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-emerald-500/10 opacity-100' 
        : 'bg-background/0 opacity-0'
    }`}>
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`} style={{ animationDuration: '4s' }} />
        <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`} style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/15 to-teal-500/15 rounded-full blur-2xl animate-pulse ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`} style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Floating ethereal particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 ${
              showContent ? 'opacity-60' : 'opacity-0'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div 
              className="w-1 h-1 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full animate-ping"
              style={{
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Morphing geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-2000 ${
              showContent ? 'opacity-20 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${i * 0.3}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <div 
              className={`w-8 h-8 border border-primary/20 rounded-full animate-spin ${
                i % 3 === 0 ? 'rounded-none' : i % 3 === 1 ? 'rounded-lg' : 'rounded-full'
              }`}
              style={{
                animationDuration: `${10 + Math.random() * 10}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
              }}
            />
          </div>
        ))}
      </div>

      {/* Main content with enhanced animations */}
      <div className="text-center relative z-10">
        {/* Glowing backdrop */}
        <div className={`absolute inset-0 -m-20 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-emerald-500/5 rounded-full blur-2xl transition-all duration-2000 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
        
        <div className={`relative transform transition-all duration-1500 ease-out ${
          showContent 
            ? 'translate-y-0 scale-100 opacity-100' 
            : 'translate-y-12 scale-90 opacity-0'
        }`}>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent relative">
            <span className="inline-block animate-pulse" style={{ animationDuration: '3s' }}>
              VentOut
            </span>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 text-8xl font-bold bg-gradient-to-r from-violet-400/20 via-blue-400/20 to-emerald-400/20 bg-clip-text text-transparent blur-sm -z-10">
              VentOut
            </div>
          </h1>
          
          {/* Enhanced decorative elements */}
          <div className="flex justify-center mt-8 space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-1000 ${
                  showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{
                  animationDelay: `${0.5 + i * 0.15}s`,
                }}
              >
                <div 
                  className="w-2 h-2 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-8 transform transition-all duration-1500 delay-700 ease-out ${
          showContent 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-6 opacity-0'
        }`}>
          <p className="text-2xl text-muted-foreground/80 font-light tracking-wide">
            Your safe space to be heard
          </p>
          
          {/* Elegant loading animation */}
          <div className="mt-12 w-48 h-1 bg-muted/30 rounded-full mx-auto overflow-hidden backdrop-blur-sm">
            <div className={`h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-3000 ease-out ${
              showContent ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-50'
            }`}>
              <div className="w-full h-full bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Subtle ripple effects */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ${
          showContent ? 'opacity-30 scale-100' : 'opacity-0 scale-50'
        }`}>
          <div className="w-96 h-96 border border-violet-400/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ${
          showContent ? 'opacity-20 scale-100' : 'opacity-0 scale-50'
        }`} style={{ animationDelay: '1s' }}>
          <div className="w-[30rem] h-[30rem] border border-blue-400/10 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
        </div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ${
          showContent ? 'opacity-15 scale-100' : 'opacity-0 scale-50'
        }`} style={{ animationDelay: '2s' }}>
          <div className="w-[36rem] h-[36rem] border border-emerald-400/10 rounded-full animate-ping" style={{ animationDuration: '8s' }} />
        </div>
      </div>
    </div>
  );
};