import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Handshake, Shield, Users, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 shadow-soft">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">From Your Street, For Your Needs</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Share with Neighbors.
              </span>
              <br />
              <span className="text-foreground">Build Community.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Lendly connects you with your neighborhood. Borrow what you need, share what you have, 
              and build trust through safe, sustainable sharing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Lendly Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, safe, and sustainable sharing in three easy steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background rounded-2xl p-8 shadow-soft hover:shadow-hover transition-all">
              <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Discover Nearby</h3>
              <p className="text-muted-foreground">
                Browse items on an interactive map or list view. See what your neighbors are sharing 
                right in your neighborhood.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 shadow-soft hover:shadow-hover transition-all">
              <div className="h-16 w-16 rounded-full bg-gradient-warm flex items-center justify-center mb-6">
                <Handshake className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Request & Share</h3>
              <p className="text-muted-foreground">
                Send requests, get approval, and use secure handover codes for safe exchanges. 
                Share for credits or rent for income.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 shadow-soft hover:shadow-hover transition-all">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Trust</h3>
              <p className="text-muted-foreground">
                Rate your experiences, earn reputation, and create a reliable community 
                based on trust and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center shadow-medium">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">100+</div>
                <div className="text-primary-foreground/80">Starting Credits</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">5★</div>
                <div className="text-primary-foreground/80">Rated Community</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">100%</div>
                <div className="text-primary-foreground/80">Verified Exchanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-4xl font-bold mb-6">Ready to Join Your Community?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start sharing, saving, and building connections with your neighbors today. 
              It's free to join!
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Lendly. Building sustainable neighborhood communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
