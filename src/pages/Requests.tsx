import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Request {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  status: string;
  handover_code: string | null;
  return_code: string | null;
  created_at: string;
  requester_id: string;
  owner_id: string;
  listing: {
    title: string;
    category: string;
    images: string[];
  };
  requester: {
    full_name: string;
    avatar_url: string | null;
  };
  owner: {
    full_name: string;
    avatar_url: string | null;
  };
}

const Requests = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchRequests(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchRequests = async (userId: string) => {
    setIsLoading(true);
    try {
      // Fetch all requests where user is involved
      const { data: requestsData, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      if (!requestsData || requestsData.length === 0) {
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setIsLoading(false);
        return;
      }

      // Get unique listing IDs and user IDs
      const listingIds = [...new Set(requestsData.map(r => r.listing_id))];
      const userIds = [...new Set([
        ...requestsData.map(r => r.requester_id),
        ...requestsData.map(r => r.owner_id)
      ])];

      // Fetch listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, category, images")
        .in("id", listingIds);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Combine data
      const requestsWithDetails = requestsData.map(req => {
        const listing = listingsData?.find(l => l.id === req.listing_id);
        const requester = profilesData?.find(p => p.id === req.requester_id);
        const owner = profilesData?.find(p => p.id === req.owner_id);

        return {
          ...req,
          listing: listing || { title: "Unknown", category: "Unknown", images: [] },
          requester: requester || { full_name: "Unknown", avatar_url: null },
          owner: owner || { full_name: "Unknown", avatar_url: null }
        };
      });

      // Split into incoming and outgoing
      const incoming = requestsWithDetails.filter(req => req.owner_id === userId);
      const outgoing = requestsWithDetails.filter(req => req.requester_id === userId);

      setIncomingRequests(incoming as Request[]);
      setOutgoingRequests(outgoing as Request[]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-request-status', {
        body: {
          requestId,
          action: 'approve',
        },
      });

      if (error) throw error;

      toast.success(`Request approved! Handover code: ${data.handoverCode}`);
      if (user) await fetchRequests(user.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.functions.invoke('update-request-status', {
        body: {
          requestId,
          action: 'reject',
        },
      });

      if (error) throw error;

      toast.success("Request rejected");
      if (user) await fetchRequests(user.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.functions.invoke('update-request-status', {
        body: {
          requestId,
          action: 'cancel',
        },
      });

      if (error) throw error;

      toast.success("Request cancelled");
      if (user) await fetchRequests(user.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      completed: "outline",
      rejected: "destructive",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderRequestCard = (request: Request, isIncoming: boolean) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{request.listing.title}</CardTitle>
            <CardDescription>
              {isIncoming ? `From: ${request.requester.full_name}` : `To: ${request.owner.full_name}`}
            </CardDescription>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>Dates: {format(new Date(request.start_date), "MMM dd, yyyy")} - {format(new Date(request.end_date), "MMM dd, yyyy")}</p>
            <p>Category: {request.listing.category}</p>
            <p>Requested: {format(new Date(request.created_at), "MMM dd, yyyy")}</p>
          </div>

          {request.handover_code && request.status === "approved" && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Handover Code: <span className="text-lg font-bold">{request.handover_code}</span></p>
            </div>
          )}

          {request.return_code && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Return Code: <span className="text-lg font-bold">{request.return_code}</span></p>
            </div>
          )}

          <div className="flex gap-2">
            {isIncoming && request.status === "pending" && (
              <>
                <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {!isIncoming && request.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => handleCancelRequest(request.id)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            {request.status === "approved" && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/browse`)}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">My Requests</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No incoming requests yet
                </CardContent>
              </Card>
            ) : (
              incomingRequests.map(request => renderRequestCard(request, true))
            )}
          </TabsContent>

          <TabsContent value="outgoing">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No outgoing requests yet
                </CardContent>
              </Card>
            ) : (
              outgoingRequests.map(request => renderRequestCard(request, false))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Requests;
