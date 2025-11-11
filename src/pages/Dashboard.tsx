import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, MapPin, List, Package, Coins, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import SplashScreen from "@/components/SplashScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

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

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

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
            <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            <h1 className="text-xl font-bold">Lendly</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8">
          <h2 className="text-4xl font-bold mb-3">Welcome back!</h2>
          <p className="text-muted-foreground text-lg">Discover items shared by your neighbors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Your Listings</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Requests</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Balance</p>
              <p className="text-3xl font-bold">100</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Community Score</p>
              <p className="text-3xl font-bold">5.0</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate("/create-listing")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-hero flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Share or Rent</h3>
                <p className="text-sm text-muted-foreground">List an item in seconds</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate("/browse")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <List className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Browse Listings</h3>
                <p className="text-sm text-muted-foreground">Explore available items</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate("/map")}
          >
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <MapPin className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Map View</h3>
                <p className="text-sm text-muted-foreground">See items on the map</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Recent Activity</h3>
          </div>
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              No recent activity yet
            </p>
            <p className="text-sm text-muted-foreground">
              Start by creating your first listing or browsing items in your neighborhood!
            </p>
            <Button 
              onClick={() => navigate("/create-listing")}
              className="mt-4"
            >
              Create Your First Listing
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
