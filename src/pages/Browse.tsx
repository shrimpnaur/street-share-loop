import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, MapPin, Coins, DollarSign } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  listing_type: string;
  price_per_day: number | null;
  credit_cost: number | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    rating_average: number;
  };
}

const Browse = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const checkAuthAndLoadListings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
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
          status,
          created_at,
          user_id
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading listings:", error);
        setIsLoading(false);
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
      setIsLoading(false);
    };

    checkAuthAndLoadListings();
  }, [navigate]);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/map")}>
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Listings</h1>
          <p className="text-muted-foreground">Discover items shared by your neighbors</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Tools & Equipment">Tools & Equipment</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Sports & Outdoor">Sports & Outdoor</SelectItem>
              <SelectItem value="Home & Garden">Home & Garden</SelectItem>
              <SelectItem value="Books & Media">Books & Media</SelectItem>
              <SelectItem value="Kitchen & Appliances">Kitchen & Appliances</SelectItem>
              <SelectItem value="Toys & Games">Toys & Games</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No listings found</p>
              <Button variant="hero" onClick={() => navigate("/create-listing")}>
                Create First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="shadow-soft hover:shadow-hover transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={listing.listing_type === "share" ? "default" : "secondary"}>
                      {listing.listing_type === "share" ? "Share" : "Rent"}
                    </Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {listing.listing_type === "share" ? (
                        <div className="flex items-center gap-1 text-primary">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">{listing.credit_cost} credits</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-secondary">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${listing.price_per_day}/day</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>By {listing.profiles?.full_name || "Unknown"}</span>
                      <span className="flex items-center gap-1">
                        ⭐ {listing.profiles?.rating_average?.toFixed(1) || "New"}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
