import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, List, Coins, DollarSign, X, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  listing_type: string;
  price_per_day: number | null;
  credit_cost: number | null;
  latitude: number | null;
  longitude: number | null;
  profiles: {
    full_name: string;
    rating_average: number;
  };
}

// Using a demo Mapbox token - users should add their own in production
const MAPBOX_STYLE = "https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtMmVnODY0djBhOTQyanM4OHB6aGp2MWEifQ.rLTaY2kSO9TXlALCbhyxEg";

const MapView = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const checkAuthAndLoadListings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user's location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation([position.coords.longitude, position.coords.latitude]);
          },
          (error) => {
            console.log("Location access denied, using default location");
            toast.info("Enable location to see items near you");
          }
        );
      }

      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          category,
          listing_type,
          price_per_day,
          credit_cost,
          latitude,
          longitude,
          user_id
        `)
        .eq("status", "active")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) {
        console.error("Error loading listings:", error);
        return;
      }

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(l => l.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, rating_average")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const listingsWithProfiles = data?.map(listing => ({
        ...listing,
        profiles: profilesMap.get(listing.user_id) || { full_name: "Unknown", rating_average: 0 }
      })) || [];

      setListings(listingsWithProfiles as any);
    };

    checkAuthAndLoadListings();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b shadow-soft z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <h1 className="text-lg font-bold bg-gradient-hero bg-clip-text text-transparent">
            Map View
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/browse")}>
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
        </div>
      </header>

      {/* Placeholder Map with Listings Grid */}
      <div className="flex-1 bg-muted/30 relative overflow-hidden">
        {/* Map placeholder background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 h-full">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="border border-border/20"></div>
            ))}
          </div>
        </div>

        {/* Center message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="shadow-medium max-w-md mx-4 text-center">
            <div className="p-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-hero mx-auto flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Interactive Map Coming Soon</h3>
              <p className="text-muted-foreground">
                The Snapchat-style map with real-time listing pins will be available in the next update.
                For now, use the browse view to see all listings.
              </p>
              <div className="pt-4 space-y-2">
                <Button variant="hero" onClick={() => navigate("/browse")} className="w-full">
                  Browse Listings
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-card rounded-lg shadow-medium p-4 space-y-2 max-w-[200px]">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-6 w-6 rounded-full bg-gradient-hero flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span>Share for Credits</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-6 w-6 rounded-full bg-gradient-warm flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span>Rent for Money</span>
          </div>
        </div>

        {/* Listing count */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card rounded-full shadow-medium px-4 py-2">
          <span className="text-sm font-medium">
            {listings.length} {listings.length === 1 ? "item" : "items"} available
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
