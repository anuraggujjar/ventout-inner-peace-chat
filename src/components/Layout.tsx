
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, Sun, Moon, History as HistoryIcon, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/history', label: 'History', icon: HistoryIcon },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground animate-pulse">
        <header className="flex items-center justify-between p-4 border-b border-border h-16">
           <div className="h-6 w-24 bg-muted rounded"></div>
           <div className="h-8 w-8 bg-muted rounded-full"></div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-6"></main>
        <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border shadow-md h-16"></nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">Sola</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <UserProfile />
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border shadow-md">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 w-1/${navItems.length} 
                ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
