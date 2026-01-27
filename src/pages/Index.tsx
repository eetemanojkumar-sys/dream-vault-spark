import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Target, Brain, Star } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col stars">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-8 glow-primary float">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display text-gradient-aurora mb-6 fade-in">
            Dream Vault
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto fade-in" style={{ animationDelay: "0.1s" }}>
            Your personal sanctuary for capturing dreams, tracking goals, and turning visions into reality.
          </p>

          {/* CTA */}
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-lg px-8 py-6 group"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 stagger-in">
            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">Track Goals</h3>
              <p className="text-sm text-muted-foreground">
                Break down dreams into actionable milestones and track your progress visually.
              </p>
            </div>

            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized summaries, action steps, and motivation powered by AI.
              </p>
            </div>

            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">Stay Inspired</h3>
              <p className="text-sm text-muted-foreground">
                Organize by category, favorite important dreams, and celebrate your wins.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground fade-in">
        <p>Dream it. Plan it. Achieve it.</p>
      </footer>
    </div>
  );
};

export default Index;
