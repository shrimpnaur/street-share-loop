import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: "Your listing 'Power Drill' has a new request", time: "2m ago", unread: true },
  { id: 2, text: "Request approved for 'Camping Tent'", time: "1h ago", unread: true },
  { id: 3, text: "You earned 5 credits from sharing!", time: "3h ago", unread: false },
];

export function NotificationBell() {
  const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">Notifications</h4>
          <ScrollArea className="h-[300px]">
            {SAMPLE_NOTIFICATIONS.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications yet
              </p>
            ) : (
              <div className="space-y-2">
                {SAMPLE_NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      notif.unread ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <p className="text-sm">{notif.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
