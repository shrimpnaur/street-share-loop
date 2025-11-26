import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, User, Star, Coins, Plus, Settings, TrendingUp, Package, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { profileSchema } from "@/lib/validations/profile";
import { FloatingNavBar } from "@/components/FloatingNavBar";

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

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
        if (import.meta.env.DEV) console.error("Error loading profile:", profileError);
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
        if (import.meta.env.DEV) console.error("Error loading listings:", listingsError);
        toast.error("Failed to load listings");
      } else if (listingsData) {
        setListings(listingsData);
      }

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id
        `)
        .eq("reviewee_id", session.user.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        if (import.meta.env.DEV) console.error("Error loading reviews:", reviewsError);
      } else if (reviewsData) {
        setReviews(reviewsData);
      }
      
      setIsLoading(false);
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      // Validate form data
      const validatedData = profileSchema.parse({
        fullName: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        avatarUrl: profile.avatar_url || "",
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: validatedData.fullName,
          phone: validatedData.phone || null,
          bio: validatedData.bio || null,
          address: validatedData.address || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setProfile({ ...profile, ...formData });
      setShowEditDialog(false);
    } catch (error: any) {
      if (error.errors) {
        // Zod validation error
        error.errors.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Failed to update profile");
        if (import.meta.env.DEV) console.error("Error updating profile:", error);
      }
    } finally {
      setIsSaving(false);
    }
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Instagram-style Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-hero flex items-center justify-center ring-4 ring-border">
              <User className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-3">{profile?.full_name}</h2>
            
            {/* Stats Row */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold">{listings.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{profile?.credits}</div>
                <div className="text-sm text-muted-foreground">Credits</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-xl font-bold">{profile?.rating_average.toFixed(1)}</span>
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>

            {/* Community Score Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Community Score: {profile?.rating_average.toFixed(1)}</span>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm text-foreground mb-3">{profile.bio}</p>
            )}

            {/* Action Button */}
            <Button 
              onClick={() => setShowEditDialog(true)} 
              variant="outline" 
              size="sm"
              className="w-full md:w-auto"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Tabs/Sections */}
        <div className="border-t border-border">
          <div className="flex items-center justify-center gap-8 py-3">
            <button className="flex items-center gap-2 pb-1 border-b-2 border-foreground">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">POSTS</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">REVIEWS</span>
            </button>
          </div>
        </div>

        {/* Posts Grid (Instagram-style) */}
        <div className="mt-6">
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-6">Share your first item with the community</p>
              <Button onClick={() => navigate("/create-listing")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="aspect-square rounded-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => setSelectedListing(listing)}
                >
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm font-medium">{listing.title}</p>
                          {listing.listing_type === "share" && listing.credit_cost && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Coins className="h-3 w-3 inline mr-1" />
                              {listing.credit_cost} credits
                            </p>
                          )}
                          {listing.listing_type === "rent" && listing.price_per_day && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{listing.price_per_day}/day
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews ({reviews.length})
            </h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Community Member</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />

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
                  toast.info("Delete functionality coming soon");
                }}>
                  Delete Listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
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
                placeholder="Tell the community about yourself..."
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
