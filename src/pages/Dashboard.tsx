import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, MapPin, List, Package, Coins, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b shadow-soft sticky top-0 z-10 animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow animate-scale-in">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Lendly
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="transition-all duration-300 hover:shadow-medium"
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="relative mb-12 animate-fade-in overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 bg-[length:200%_100%] animate-gradient-shift p-8 shadow-elegant" style={{ animationDelay: "100ms" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent animate-pulse-glow">
              Welcome back!
            </h2>
            <p className="text-muted-foreground text-xl">Discover items shared by your neighbors</p>
          </div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-hero opacity-20 blur-3xl animate-float"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gradient-warm opacity-20 blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-medium hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow animate-pulse-glow">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <TrendingUp className="h-5 w-5 text-primary animate-float" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Your Listings</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-medium hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: "300ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow" style={{ animationDelay: "1s" }}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-accent animate-float" style={{ animationDelay: "2s" }} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Active Requests</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-medium hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: "400ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow animate-pulse-glow" style={{ animationDelay: "2s" }}>
                  <Coins className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Credits Balance</p>
                <p className="text-3xl font-bold">100</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-medium hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: "500ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow" style={{ animationDelay: "3s" }}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-accent animate-pulse"></div>
                  <div className="h-1 w-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-1 w-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Community Score</p>
                <p className="text-3xl font-bold">5.0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-2 border-primary/20 hover:border-primary/40"
            style={{ animationDelay: "600ms" }}
            onClick={() => navigate("/create-listing")}
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity duration-300 animate-gradient-shift bg-[length:200%_100%]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <div className="relative p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-float">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">Share or Rent</h3>
                <p className="text-sm text-muted-foreground">List an item in seconds</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-2 border-border hover:border-primary/20"
            style={{ animationDelay: "700ms" }}
            onClick={() => navigate("/browse")}
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-5 transition-opacity duration-300 animate-gradient-shift bg-[length:200%_100%]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <div className="relative p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-gradient-hero group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 animate-float" style={{ animationDelay: "1s" }}>
                <List className="h-8 w-8 text-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">Browse Listings</h3>
                <p className="text-sm text-muted-foreground">Explore available items</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-2 border-border hover:border-primary/20"
            style={{ animationDelay: "800ms" }}
            onClick={() => navigate("/map")}
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-5 transition-opacity duration-300 animate-gradient-shift bg-[length:200%_100%]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <div className="relative p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-gradient-hero group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 animate-float" style={{ animationDelay: "2s" }}>
                <MapPin className="h-8 w-8 text-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">Map View</h3>
                <p className="text-sm text-muted-foreground">See items on the map</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-8 shadow-medium border-2 animate-fade-in" style={{ animationDelay: "900ms" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Recent Activity</h3>
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          </div>
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-hero/10 flex items-center justify-center">
              <Clock className="h-10 w-10 text-primary/50" />
            </div>
            <p className="text-muted-foreground text-lg">
              No recent activity yet
            </p>
            <p className="text-sm text-muted-foreground">
              Start by creating your first listing or browsing items in your neighborhood!
            </p>
            <Button 
              variant="hero" 
              onClick={() => navigate("/create-listing")}
              className="mt-4 transition-all duration-300 hover:shadow-glow"
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
