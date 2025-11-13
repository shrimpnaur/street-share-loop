import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, MapPin, List, Clock, Coins, TrendingUp, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardDrawer } from "@/components/DashboardDrawer";
import { NotificationBell } from "@/components/NotificationBell";
import { ChatbotDialog } from "@/components/ChatbotDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DashboardDrawer />
            <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            <h1 className="text-xl font-bold">Lendly</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ChatbotDialog />
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        {/* 5 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Requests Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/requests")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-10 w-10 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Requests</h3>
                <p className="text-4xl font-bold text-primary mb-2">0</p>
                <p className="text-sm text-muted-foreground">Active requests</p>
              </div>
            </div>
          </Card>

          {/* Credits Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Credits</h3>
                <p className="text-4xl font-bold text-primary mb-2">100</p>
                <p className="text-sm text-muted-foreground">Available balance</p>
              </div>
            </div>
          </Card>

          {/* Community Score Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Community Score</h3>
                <p className="text-4xl font-bold text-primary mb-2">5.0</p>
                <p className="text-sm text-muted-foreground">Your rating</p>
              </div>
            </div>
          </Card>

          {/* Share or Post Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/create-listing")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-hero flex items-center justify-center">
                <Plus className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Share or Post</h3>
                <p className="text-sm text-muted-foreground">List an item to share or rent</p>
              </div>
            </div>
          </Card>

          {/* Browse Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/browse")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <List className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Browse</h3>
                <p className="text-sm text-muted-foreground">Explore available items</p>
              </div>
            </div>
          </Card>

          {/* Map Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/map")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Map</h3>
                <p className="text-sm text-muted-foreground">View items within 10km</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
