import { Menu, Home, Package, MessageSquare, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardDrawer() {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate("/browse")}
          >
            <Package className="mr-2 h-4 w-4" />
            My Listings
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate("/profile")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
