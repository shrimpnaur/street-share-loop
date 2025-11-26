import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-full shadow-hover backdrop-blur-sm px-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant={isActive("/map") ? "default" : "ghost"}
            size="lg"
            className="rounded-full gap-2 transition-all hover:scale-105"
            onClick={() => navigate("/map")}
          >
            <MapPin className="h-5 w-5" />
            <span className="hidden sm:inline">Map View</span>
          </Button>

          <Button
            variant={isActive("/browse") ? "default" : "ghost"}
            size="lg"
            className="rounded-full gap-2 transition-all hover:scale-105"
            onClick={() => navigate("/browse")}
          >
            <List className="h-5 w-5" />
            <span className="hidden sm:inline">Browse Items</span>
          </Button>

          <Button
            variant={isActive("/create-listing") ? "default" : "ghost"}
            size="lg"
            className="rounded-full gap-2 bg-gradient-hero text-primary-foreground hover:opacity-90 transition-all hover:scale-105"
            onClick={() => navigate("/create-listing")}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Share/Rent</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
