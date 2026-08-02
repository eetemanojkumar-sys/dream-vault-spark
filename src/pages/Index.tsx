import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain, Stars, Users, ChevronRight, Compass, Rocket, Zap } from "lucide-react";
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
        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Dream Vault</span>
        </div>
        <Button variant="ghost" onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground text-sm">
          Sign In
        </Button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Rocket className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary/90">Social Dream Platform — Free to Start</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1] tracking-tight mb-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
              <span className="text-gradient-aurora">Dream Bold.</span>
              <br />
              <span className="text-shimmer">Share Freely</span>
              <br />
              <span className="text-shimmer">with dream community</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed fade-in-up" style={{ animationDelay: "0.3s" }}>
              The modern platform where dreamers connect, share visions, and inspire each other to build extraordinary futures.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Button size="lg" onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-sm font-semibold px-8 h-12 group rounded-xl w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/explore")}
                className="text-sm font-semibold px-8 h-12 group border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl w-full sm:w-auto">
                <Compass className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                Explore
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-4 mt-12 fade-in-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex -space-x-2">
                {["bg-gradient-to-br from-primary to-dream-shimmer", "bg-gradient-to-br from-dream-aurora to-dream-cosmic",
                  "bg-gradient-to-br from-accent to-dream-gold", "bg-gradient-to-br from-dream-sunset to-primary",
                ].map((bg, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                    <span className="text-[9px] font-bold text-foreground">{["✦", "♡", "⚡", "☾"][i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Join <span className="text-foreground font-medium">dreamers</span> worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                Everything you need to <span className="text-gradient-aurora">dream big</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Connect, create, and grow with a community of dreamers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 stagger-in">
              {[
                { icon: Users, title: "Social Feed", desc: "Follow dreamers, react to their visions, and build a supportive community.", color: "text-primary", bg: "bg-primary/10" },
                { icon: Brain, title: "AI Dream GPT", desc: "Chat with AI about your dreams, get insights, and generate creative stories.", color: "text-dream-cosmic", bg: "bg-dream-cosmic/10" },
                { icon: Stars, title: "Stories & Trends", desc: "Discover trending dreams, share your journey, and inspire others.", color: "text-accent", bg: "bg-accent/10" },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="surface-card p-6 group cursor-default">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="surface-card p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/10 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Ready to start <span className="text-gradient-aurora">dreaming</span>?
                </h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                  Join Dream Vault — it's free, social, and powered by AI.
                </p>
                <Button size="lg" onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-sm font-semibold px-10 h-12 group rounded-xl">
                  Create Account <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/30 px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Dream Vault</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Dream it. Share it. Achieve it.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
