
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Shield, FileText, LogOut, Moon } from 'lucide-react'; // LogOut for Supabase

const SettingsPage = () => {
  // Placeholder functions
  const handleToggleDarkMode = () => console.log("Toggle Dark Mode (coming soon)");
  const handleNotifications = () => console.log("Notification settings (coming soon)");
  const handleLogout = () => {
    console.log("Logout clicked - integrate with Supabase auth");
    alert("Logout functionality requires Supabase integration.");
  };


  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
        
        <div className="space-y-6 max-w-md mx-auto">
          <div className="bg-card p-5 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-primary">Appearance</h2>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark Mode</span>
              <Button variant="outline" size="sm" onClick={handleToggleDarkMode} className="flex items-center">
                <Moon className="mr-2 h-4 w-4" /> Toggle (Soon)
              </Button>
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-primary">Notifications</h2>
             <div className="flex items-center justify-between">
              <span className="text-foreground">Daily Quote Notifications</span>
              <Button variant="outline" size="sm" onClick={handleNotifications} className="flex items-center">
                Enable/Disable (Soon)
              </Button>
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-primary">Legal</h2>
            <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
              <FileText className="mr-3 h-5 w-5" /> Terms of Use (Coming Soon)
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
              <Shield className="mr-3 h-5 w-5" /> Privacy Policy (Coming Soon)
            </Button>
          </div>

          <div className="bg-card p-5 rounded-xl shadow">
             <h2 className="text-xl font-semibold mb-3 text-primary">Account</h2>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" /> Logout (Needs Supabase)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Login/Signup and account management will be available after Supabase integration.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
