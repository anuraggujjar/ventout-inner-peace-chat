
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, LogOut, Moon, AlertTriangle } from 'lucide-react';

const SettingsPage = () => {
  const handleToggleDarkMode = () => console.log("Toggle Dark Mode (coming soon)");
  const handleNotifications = () => console.log("Notification settings (coming soon)");
  const handleReportIssue = () => {
    console.log("Report issue clicked");
    alert("Report issue functionality will open a support form.");
  };
  const handleLogout = () => {
    console.log("Logout clicked - integrate with Supabase auth");
    alert("Logout functionality requires Supabase integration.");
  };

  return (
    <Layout>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
        
        {/* Appearance Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark Mode</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleDarkMode} 
                className="flex items-center hover:bg-primary/10"
              >
                <Moon className="mr-2 h-4 w-4" /> 
                Toggle (Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Daily Quote Notifications</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNotifications} 
                className="hover:bg-primary/10"
              >
                Enable/Disable (Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
              onClick={handleReportIssue}
            >
              <AlertTriangle className="mr-3 h-5 w-5" /> 
              Report an Issue
            </Button>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
            >
              <FileText className="mr-3 h-5 w-5" /> 
              Terms of Use (Coming Soon)
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
            >
              <Shield className="mr-3 h-5 w-5" /> 
              Privacy Policy (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full hover:bg-destructive/90 hover:shadow-destructive/25" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" /> 
              Logout (Needs Supabase)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Login/Signup and account management will be available after Supabase integration.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
