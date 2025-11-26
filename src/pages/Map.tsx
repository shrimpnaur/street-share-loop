import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, List, Coins, DollarSign, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FloatingNavBar } from "@/components/FloatingNavBar";

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

// Hardcoded dummy listings for demo
const DUMMY_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Power Drill",
    description: "Makita power drill, barely used",
    category: "tools",
    listing_type: "share",
    price_per_day: null,
    credit_cost: 5,
    latitude: 12.9716,
    longitude: 77.5946,
    profiles: { full_name: "Raj Kumar", rating_average: 4.5 }
  },
  {
    id: "2",
    title: "Bicycle",
    description: "Mountain bike for weekend rides",
    category: "sports",
    listing_type: "rent",
    price_per_day: 100,
    credit_cost: null,
    latitude: 12.9750,
    longitude: 77.5980,
    profiles: { full_name: "Priya Singh", rating_average: 4.8 }
  },
  {
    id: "3",
    title: "Camping Tent",
    description: "4-person tent, perfect condition",
    category: "outdoor",
    listing_type: "rent",
    price_per_day: 200,
    credit_cost: null,
    latitude: 12.9700,
    longitude: 77.5910,
    profiles: { full_name: "Amit Sharma", rating_average: 4.2 }
  },
  {
    id: "4",
    title: "Lawn Mower",
    description: "Electric lawn mower",
    category: "garden",
    listing_type: "share",
    price_per_day: null,
    credit_cost: 8,
    latitude: 12.9780,
    longitude: 77.5930,
    profiles: { full_name: "Neha Patel", rating_average: 5.0 }
  },
  {
    id: "5",
    title: "Guitar",
    description: "Acoustic guitar for beginners",
    category: "music",
    listing_type: "rent",
    price_per_day: 150,
    credit_cost: null,
    latitude: 12.9690,
    longitude: 77.5970,
    profiles: { full_name: "Arjun Mehta", rating_average: 4.6 }
  },
];

mapboxgl.accessToken = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtMmVnODY0djBhOTQyanM4OHB6aGp2MWEifQ.rLTaY2kSO9TXlALCbhyxEg";

const MapView = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>(DUMMY_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with dark style (Snapchat-like)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.5946, 12.9716], // Bangalore center
      zoom: 13,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add 10km radius circle
    map.current.on('load', () => {
      if (!map.current) return;
      
      const center: [number, number] = [77.5946, 12.9716];
      const radiusInKm = 10;
      const points = 64;
      const distanceX = radiusInKm / (111.32 * Math.cos(center[1] * Math.PI / 180));
      const distanceY = radiusInKm / 110.574;

      const coordinates = [];
      for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coordinates.push([center[0] + x, center[1] + y]);
      }
      coordinates.push(coordinates[0]);

      map.current.addSource('radius', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: {
          'fill-color': '#34d399',
          'fill-opacity': 0.1
        }
      });

      map.current.addLayer({
        id: 'radius-outline',
        type: 'line',
        source: 'radius',
        paint: {
          'line-color': '#34d399',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    });

    // Add markers for each listing
    listings.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "50px";
      el.style.height = "50px";
      el.style.cursor = "pointer";
      
      // Different styles for share vs rent
      const isShare = listing.listing_type === "share";
      const bgGradient = isShare
        ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-light)))"
        : "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-light)))";
      
      el.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: ${bgGradient};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 18px;
          transition: transform 0.2s;
        ">
          ${isShare ? "S" : "R"}
        </div>
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
      });
      
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      el.addEventListener("click", () => {
        setSelectedListing(listing);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [listings]);

  return (
    <div className="h-screen flex flex-col pb-24">
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

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg shadow-medium p-4 space-y-2 max-w-[200px] z-10">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-6 w-6 rounded-full bg-gradient-hero flex items-center justify-center shrink-0 border-2 border-white">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span>Share for Credits</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-6 w-6 rounded-full bg-gradient-warm flex items-center justify-center shrink-0 border-2 border-white">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span>Rent for Money</span>
          </div>
        </div>

        {/* Listing count */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-full shadow-medium px-4 py-2 z-10">
          <span className="text-sm font-medium">
            {listings.length} {listings.length === 1 ? "item" : "items"} nearby
          </span>
        </div>

        {/* Selected Listing Card */}
        {selectedListing && (
          <div className="absolute bottom-6 right-6 w-80 z-10">
            <Card className="shadow-elegant bg-card/95 backdrop-blur-sm">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedListing.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedListing.profiles.full_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedListing(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm">{selectedListing.description}</p>
                
                <div className="flex items-center gap-2">
                  <Badge variant={selectedListing.listing_type === "share" ? "default" : "secondary"}>
                    {selectedListing.listing_type === "share" ? (
                      <>
                        <Coins className="h-3 w-3 mr-1" />
                        {selectedListing.credit_cost} credits
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-3 w-3 mr-1" />
                        ₹{selectedListing.price_per_day}/day
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline">{selectedListing.category}</Badge>
                </div>

                <Button className="w-full" variant="hero">
                  Request Item
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
};

export default MapView;
