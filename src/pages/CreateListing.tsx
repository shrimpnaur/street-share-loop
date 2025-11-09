import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Tools & Equipment",
  "Electronics",
  "Sports & Outdoor",
  "Home & Garden",
  "Books & Media",
  "Kitchen & Appliances",
  "Toys & Games",
  "Other"
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    listing_type: "share",
    price_per_day: "",
    deposit_amount: "",
    credit_cost: "10",
    available_from: "",
    available_until: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);

    try {
      const listingData: any = {
        user_id: userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        listing_type: formData.listing_type,
        available_from: formData.available_from || null,
        available_until: formData.available_until || null,
        status: "active"
      };

      if (formData.listing_type === "rent") {
        listingData.price_per_day = parseFloat(formData.price_per_day);
        listingData.deposit_amount = formData.deposit_amount ? parseFloat(formData.deposit_amount) : null;
      } else {
        listingData.credit_cost = parseInt(formData.credit_cost);
      }

      const { error } = await supabase
        .from("listings")
        .insert(listingData);

      if (error) throw error;

      toast.success("Listing created successfully!");
      navigate("/browse");
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
      console.error("Error creating listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
              Create New Listing
            </CardTitle>
            <CardDescription>
              Share an item with your neighbors or list it for rent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Power Drill, Camping Tent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item, its condition, and any special instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Listing Type *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formData.listing_type === "share" ? "hero" : "outline"}
                    onClick={() => setFormData({ ...formData, listing_type: "share" })}
                    className="h-20 flex-col"
                  >
                    <span className="text-lg mb-1">Share for Credits</span>
                    <span className="text-xs opacity-80">Free community sharing</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.listing_type === "rent" ? "secondary" : "outline"}
                    onClick={() => setFormData({ ...formData, listing_type: "rent" })}
                    className="h-20 flex-col"
                  >
                    <span className="text-lg mb-1">Rent for Money</span>
                    <span className="text-xs opacity-80">Earn from your items</span>
                  </Button>
                </div>
              </div>

              {formData.listing_type === "rent" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Day ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Deposit Amount ($)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00 (optional)"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="credits">Credit Cost *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.credit_cost}
                    onChange={(e) => setFormData({ ...formData, credit_cost: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 5-20 credits depending on item value
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="date"
                    value={formData.available_until}
                    onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateListing;
