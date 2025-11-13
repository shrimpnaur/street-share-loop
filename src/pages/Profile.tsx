import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, User, Star, Coins, Plus } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  address: string | null;
  credits: number;
  rating_average: number;
  rating_count: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  listing_type: string;
  price_per_day: number | null;
  credit_cost: number | null;
  status: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    address: "",
  });

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        toast.error("Failed to load profile");
      } else if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          address: profileData.address || "",
        });
      }

      // Load user's listings
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (listingsError) {
        console.error("Error loading listings:", listingsError);
      } else if (listingsData) {
        setListings(listingsData);
      }
      
      setIsLoading(false);
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profile updated successfully!");
      setProfile({ ...profile, ...formData });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Profile Stats Card */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-hero text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-background/20 flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{profile?.rating_average.toFixed(1)} ({profile?.rating_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span>{profile?.credits} credits</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* My Listings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Button onClick={() => navigate("/create-listing")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't created any listings yet</p>
                <Button onClick={() => navigate("/create-listing")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border"
                  onClick={() => setSelectedListing(listing)}
                >
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Listing Details Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedListing?.title}</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Type:</span> {selectedListing.listing_type === "share" ? "Share" : "Rent"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Category:</span> {selectedListing.category}
                </p>
                {selectedListing.listing_type === "rent" && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Price:</span> ₹{selectedListing.price_per_day}/day
                  </p>
                )}
                {selectedListing.listing_type === "share" && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Credits:</span> {selectedListing.credit_cost} credits
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span> {selectedListing.status}
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate(`/create-listing?edit=${selectedListing.id}`)}>
                  Edit Listing
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  // TODO: Implement delete
                  toast.info("Delete functionality coming soon");
                }}>
                  Delete Listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
