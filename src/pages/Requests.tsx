import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Phone, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, isPast, parseISO, isSameDay } from "date-fns";

interface Request {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  status: string;
  handover_code: string | null;
  return_code: string | null;
  contact_date: string | null;
  contact_time: string | null;
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
    phone?: string;
  };
  owner: {
    full_name: string;
    avatar_url: string | null;
    phone?: string;
  };
}

// Dummy data for testing
const DUMMY_REQUESTS: Request[] = [
  {
    id: "dummy-1",
    listing_id: "listing-1",
    start_date: "2025-12-01",
    end_date: "2025-12-05",
    status: "pending",
    handover_code: null,
    return_code: null,
    contact_date: null,
    contact_time: null,
    created_at: "2025-11-20T10:00:00Z",
    requester_id: "user-2",
    owner_id: "current-user",
    listing: {
      title: "Power Drill",
      category: "Tools & Equipment",
      images: [],
    },
    requester: {
      full_name: "John Doe",
      avatar_url: null,
      phone: "+1234567890",
    },
    owner: {
      full_name: "You",
      avatar_url: null,
    },
  },
  {
    id: "dummy-2",
    listing_id: "listing-2",
    start_date: "2025-11-28",
    end_date: "2025-11-30",
    status: "approved",
    handover_code: "1234",
    return_code: null,
    contact_date: "2025-11-28",
    contact_time: "14:00",
    created_at: "2025-11-25T10:00:00Z",
    requester_id: "current-user",
    owner_id: "user-3",
    listing: {
      title: "Camping Tent",
      category: "Sports & Outdoor",
      images: [],
    },
    requester: {
      full_name: "You",
      avatar_url: null,
    },
    owner: {
      full_name: "Jane Smith",
      avatar_url: null,
      phone: "+1987654321",
    },
  },
  {
    id: "dummy-3",
    listing_id: "listing-3",
    start_date: "2025-12-10",
    end_date: "2025-12-15",
    status: "pending",
    handover_code: null,
    return_code: null,
    contact_date: null,
    contact_time: null,
    created_at: "2025-11-26T15:00:00Z",
    requester_id: "current-user",
    owner_id: "user-4",
    listing: {
      title: "Mountain Bike",
      category: "Sports & Outdoor",
      images: [],
    },
    requester: {
      full_name: "You",
      avatar_url: null,
    },
    owner: {
      full_name: "Mike Johnson",
      avatar_url: null,
    },
  },
];

const Requests = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [contactDate, setContactDate] = useState("");
  const [contactTime, setContactTime] = useState("");

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

      // Add dummy data if no real requests
      const incomingWithDummy = incoming.length === 0 
        ? DUMMY_REQUESTS.filter(r => r.owner_id === "current-user")
        : incoming;
      const outgoingWithDummy = outgoing.length === 0
        ? DUMMY_REQUESTS.filter(r => r.requester_id === "current-user")
        : outgoing;

      setIncomingRequests(incomingWithDummy as Request[]);
      setOutgoingRequests(outgoingWithDummy as Request[]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowScheduleDialog(true);
  };

  const handleConfirmAccept = async () => {
    if (!contactDate || !contactTime) {
      toast.error("Please set contact date and time");
      return;
    }

    try {
      // For dummy data, just update locally
      if (selectedRequestId.startsWith("dummy-")) {
        const updatedIncoming = incomingRequests.map(req =>
          req.id === selectedRequestId
            ? { ...req, status: "approved", handover_code: "1234", contact_date: contactDate, contact_time: contactTime }
            : req
        );
        setIncomingRequests(updatedIncoming);
        toast.success("Request approved! Handover code: 1234");
        setShowScheduleDialog(false);
        setContactDate("");
        setContactTime("");
        return;
      }

      // Real request handling
      const { data, error } = await supabase.functions.invoke('update-request-status', {
        body: {
          requestId: selectedRequestId,
          action: 'approve',
        },
      });

      if (error) throw error;

      // Update contact schedule
      await supabase
        .from("requests")
        .update({
          contact_date: contactDate,
          contact_time: contactTime,
        })
        .eq("id", selectedRequestId);

      toast.success(`Request approved! Handover code: ${data.handoverCode}`);
      setShowScheduleDialog(false);
      setContactDate("");
      setContactTime("");
      if (user) await fetchRequests(user.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // For dummy data
      if (requestId.startsWith("dummy-")) {
        const updatedIncoming = incomingRequests.filter(req => req.id !== requestId);
        setIncomingRequests(updatedIncoming);
        toast.success("Request rejected");
        return;
      }

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
      // For dummy data
      if (requestId.startsWith("dummy-")) {
        const updatedOutgoing = outgoingRequests.filter(req => req.id !== requestId);
        setOutgoingRequests(updatedOutgoing);
        toast.success("Request cancelled");
        return;
      }

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

  const handleMaskedCall = (phoneNumber: string) => {
    toast.success("Initiating masked call...", {
      description: "Connecting you securely without revealing numbers",
    });
    // In production, this would trigger actual masked calling service
    if (import.meta.env.DEV) console.log("Masked call to:", phoneNumber);
  };

  const isContactTimeNow = (contactDate: string | null, contactTime: string | null) => {
    if (!contactDate || !contactTime) return false;
    const now = new Date();
    const scheduledDateTime = parseISO(`${contactDate}T${contactTime}`);
    return isSameDay(now, scheduledDateTime) && 
           now.getHours() === scheduledDateTime.getHours();
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

  const renderRequestCard = (request: Request, isIncoming: boolean) => {
    const showCallIcon = request.status === "approved" && 
                         request.contact_date && 
                         request.contact_time &&
                         isContactTimeNow(request.contact_date, request.contact_time);

    const otherParty = isIncoming ? request.requester : request.owner;

    return (
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

            {request.status === "approved" && request.contact_date && request.contact_time && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Scheduled Contact</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(request.contact_date), "MMM dd, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {request.contact_time}
                  </span>
                </div>
              </div>
            )}

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

            <div className="flex gap-2 flex-wrap">
              {isIncoming && request.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}

              {!isIncoming && request.status === "pending" && (
                <Button size="sm" variant="outline" onClick={() => handleCancelRequest(request.id)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}

              {!isIncoming && request.status === "rejected" && (
                <Badge variant="destructive">Rejected by lender</Badge>
              )}

              {showCallIcon && otherParty.phone && (
                <Button 
                  size="sm" 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleMaskedCall(otherParty.phone!)}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call Now (Masked)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Contact</DialogTitle>
            <DialogDescription>
              Set a date and time for the borrower to contact you for item pickup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-date">Contact Date</Label>
              <Input
                id="contact-date"
                type="date"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-time">Contact Time</Label>
              <Input
                id="contact-time"
                type="time"
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAccept}>
              Confirm & Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
