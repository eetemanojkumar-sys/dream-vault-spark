import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Target, Brain, Star, Stars, Zap, Users, Shield, ChevronRight, Moon, Compass } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 fade-in">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xl text-foreground">Dream Vault</span>
        </div>
        <Button variant="ghost" onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground">
          Sign In
        </Button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Social Dream Platform • Free to Start</span>
            </div>

            <div className="fade-in-scale" style={{ animationDelay: "0.2s" }}>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-dream-shimmer/20 mb-8 float border border-primary/20 glow-intense">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-display leading-[0.95] mb-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
              <span className="text-gradient-aurora">Share Dreams.</span>
              <br />
              <span className="text-shimmer">Inspire Others.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: "0.4s" }}>
              The social platform where dreamers connect, share visions, and inspire each other to achieve extraordinary goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-in-up" style={{ animationDelay: "0.5s" }}>
              <Button size="lg" onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-base px-8 py-6 group rounded-xl w-full sm:w-auto">
                Join the Community
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/explore")}
                className="text-base px-8 py-6 group border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-xl w-full sm:w-auto">
                <Compass className="w-5 h-5 mr-2 text-primary" />
                Explore Dreams
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 mt-10 fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex -space-x-2">
                {["bg-gradient-to-br from-primary to-dream-shimmer", "bg-gradient-to-br from-dream-aurora to-dream-cosmic",
                  "bg-gradient-to-br from-accent to-dream-gold", "bg-gradient-to-br from-dream-sunset to-primary",
                ].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-foreground">{["✦", "♡", "⚡", "☾"][i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Join <span className="text-foreground font-medium">dreamers</span> worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display text-gradient-aurora mb-3">Your Dream Social Network</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Connect, share, and grow with a community of dreamers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5 stagger-in">
              {[
                { icon: Users, title: "Social Feed", desc: "Follow dreamers, react to their dreams, and build a supportive community.", gradient: "from-primary/20 to-dream-shimmer/10", iconColor: "text-primary" },
                { icon: Brain, title: "AI Dream GPT", desc: "Chat with AI about your dreams, get insights, and generate creative stories.", gradient: "from-dream-cosmic/20 to-dream-aurora/10", iconColor: "text-dream-cosmic" },
                { icon: Stars, title: "Stories & Trends", desc: "See trending dreams, discover new inspirations, and share your journey.", gradient: "from-accent/20 to-dream-gold/10", iconColor: "text-accent" },
              ].map(({ icon: Icon, title, desc, gradient, iconColor }) => (
                <div key={title} className="glass-card-hover p-6 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/15 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-display text-foreground mb-4">
                  Ready to Share Your <span className="text-gradient-aurora">Dreams</span>?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Join Dream Vault and become part of a community that turns aspirations into achievements.
                </p>
                <Button size="lg" onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-base px-10 py-6 group rounded-xl">
                  Get Started Free <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/30 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-display">Dream Vault</span>
          </div>
          <p className="text-xs text-muted-foreground">Dream it. Share it. Achieve it.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
