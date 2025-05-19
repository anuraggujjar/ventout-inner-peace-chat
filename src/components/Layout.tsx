
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Settings } from 'lucide-react'; // MessageSquare for chat placeholder

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  // Placeholder for chat, perhaps directly go to a chat initiation screen or a list of active chats.
  // For now, let's make it a direct link to a placeholder "Start Chat" or "Listeners" page.
  // We'll use the home screen's "Start Talking" button for now.
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header (Optional, can be added later if needed for specific pages) */}
      {/* <header className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">VentOut</h1>
      </header> */}
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border shadow-md">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200
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
