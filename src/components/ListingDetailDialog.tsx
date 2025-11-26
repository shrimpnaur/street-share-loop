import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Star, Calendar as CalendarIcon, DollarSign, Coins, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ListingDetailDialogProps {
  listingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  listing_type: string;
  price_per_day: number | null;
  credit_cost: number | null;
  available_from: string | null;
  available_until: string | null;
  deposit_amount: number | null;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
}

interface OwnerProfile {
  full_name: string;
  rating_average: number;
  rating_count: number;
  avatar_url: string | null;
  phone?: string;
  address?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  profiles: {
    full_name: string;
  };
}

export const ListingDetailDialog = ({ listingId, open, onOpenChange }: ListingDetailDialogProps) => {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && listingId) {
      loadListingDetails();
    }
  }, [open, listingId]);

  const loadListingDetails = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch listing details
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);

      // Fetch owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from("profiles")
        .select("full_name, rating_average, rating_count, avatar_url")
        .eq("id", listingData.user_id)
        .single();

      if (ownerError) throw ownerError;
      setOwner(ownerData);

      // Fetch reviews for this owner
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id,
          profiles:reviewer_id (full_name)
        `)
        .eq("reviewee_id", listingData.user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (reviewsData) {
        setReviews(reviewsData as any);
      }

      // Calculate distance if coordinates available
      if (listingData.latitude && listingData.longitude) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("latitude, longitude")
          .eq("id", user.id)
          .single();

        if (userProfile?.latitude && userProfile?.longitude) {
          const dist = calculateDistance(
            userProfile.latitude,
            userProfile.longitude,
            listingData.latitude,
            listingData.longitude
          );
          setDistance(dist);
        }
      }
    } catch (error) {
      console.error("Error loading listing details:", error);
      toast.error("Failed to load listing details");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRequestSubmit = async () => {
    if (!startDate || !endDate || !listing) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("requests")
        .insert({
          listing_id: listing.id,
          requester_id: user.id,
          owner_id: listing.user_id,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          status: "pending",
          credits_held: listing.listing_type === "share" ? listing.credit_cost : null,
          payment_amount: listing.listing_type === "rent" ? listing.price_per_day : null,
          payment_status: listing.listing_type === "rent" ? "pending" : null,
        })
        .select()
        .single();

      if (error) throw error;

      setRequestId(data.id);
      toast.success("Request sent successfully!");
      
      // Now fetch owner's contact details
      const { data: ownerContact } = await supabase
        .from("profiles")
        .select("phone, address")
        .eq("id", listing.user_id)
        .single();

      if (ownerContact) {
        setOwner(prev => prev ? { ...prev, ...ownerContact } : null);
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    // Show first 3 and last 2 digits, mask the rest
    return phone.replace(/(\d{3})\d+(\d{2})/, "$1****$2");
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing || !owner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={listing.listing_type === "share" ? "default" : "secondary"}>
                {listing.listing_type === "share" ? "Share" : "Rent"}
              </Badge>
              <Badge variant="outline">{listing.category}</Badge>
              {distance && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{distance.toFixed(1)} km away</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{listing.description}</p>
          </div>

          {/* Price/Credits */}
          <Card>
            <CardContent className="pt-6">
              {listing.listing_type === "share" ? (
                <div className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{listing.credit_cost} credits</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-secondary" />
                    <span className="font-semibold">${listing.price_per_day}/day</span>
                  </div>
                  {listing.deposit_amount && (
                    <p className="text-sm text-muted-foreground">
                      Deposit: ${listing.deposit_amount}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Info */}
          <div>
            <h3 className="font-semibold mb-3">Owned by</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt={owner.full_name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">{owner.full_name[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium">{owner.full_name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{owner.rating_average?.toFixed(1) || "New"}</span>
                  <span>({owner.rating_count || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Reviews</h3>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{review.profiles?.full_name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Request Form or Contact Info */}
          {!requestId ? (
            !showRequestForm ? (
              <Button onClick={() => setShowRequestForm(true)} className="w-full" size="lg">
                Request This Item
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Select Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(date) => date < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowRequestForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleRequestSubmit} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-primary">Request Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your request has been sent to the owner. Once approved, you can coordinate pickup.
                </p>
                {owner.phone && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Contact Owner:</p>
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm">{maskPhoneNumber(owner.phone)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      📞 Secure masked calling enabled - Your number stays private
                    </p>
                  </div>
                )}
                {owner.address && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Pickup Location:</p>
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{owner.address}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
