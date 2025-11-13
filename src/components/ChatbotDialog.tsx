import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "bot";
  content: string;
}

const CHATBOT_RESPONSES: Record<string, string> = {
  default: "I'm here to help you with Lendly! You can ask me about sharing items, credits, rentals, the map view, or how to get started.",
  credits: "You start with 100 credits! Use credits to borrow items from your neighbors. You earn credits when you share your items. Credits are held in escrow during transactions and released after successful returns.",
  share: "To share an item: Click 'Share or Rent' → Fill in item details → Choose 'Share' type → Set credit cost → Upload photos → Post! Your neighbors can then request to borrow it.",
  rent: "To rent an item: Click 'Share or Rent' → Fill in item details → Choose 'Rent' type → Set daily price and deposit → Upload photos → Post! You'll receive payment when items are rented.",
  map: "The map view shows all available items within 10km of your location. Click on markers to see details. Green markers are shared items (credits), orange are rentals (paid).",
  request: "To request an item: Find it on Browse or Map → Click to view details → Send request → Wait for approval → Use handover code (4-digit) to collect → Return with return code → Leave a review!",
  safety: "Safety first! Use handover codes for exchanges. Check user ratings before requesting. Meet in safe public places. Report any issues through your dashboard.",
  rating: "Your community score is based on completed transactions and reviews. Complete more exchanges and get positive reviews to improve your rating. Good ratings build trust!"
};

export function ChatbotDialog() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm the Lendly assistant. Ask me anything about sharing, renting, credits, or how to use the platform!" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    // Simple keyword matching for responses
    const lowerInput = input.toLowerCase();
    let response = CHATBOT_RESPONSES.default;

    if (lowerInput.includes("credit")) response = CHATBOT_RESPONSES.credits;
    else if (lowerInput.includes("share")) response = CHATBOT_RESPONSES.share;
    else if (lowerInput.includes("rent")) response = CHATBOT_RESPONSES.rent;
    else if (lowerInput.includes("map")) response = CHATBOT_RESPONSES.map;
    else if (lowerInput.includes("request") || lowerInput.includes("borrow")) response = CHATBOT_RESPONSES.request;
    else if (lowerInput.includes("safe") || lowerInput.includes("trust")) response = CHATBOT_RESPONSES.safety;
    else if (lowerInput.includes("rating") || lowerInput.includes("score")) response = CHATBOT_RESPONSES.rating;

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", content: response }]);
    }, 500);

    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lendly Assistant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
