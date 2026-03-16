import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Target, Brain, Star, Stars, Zap, Users, Shield, ChevronRight, Moon, Compass } from "lucide-react";
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
    <div className="min-h-screen flex flex-col stars nebula-bg">
      {/* Floating Orbs - Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-primary/10 blur-[100px] breathe" />
        <div className="absolute top-[60%] right-[10%] w-96 h-96 rounded-full bg-dream-shimmer/8 blur-[120px] breathe-slow" />
        <div className="absolute bottom-[20%] left-[30%] w-64 h-64 rounded-full bg-dream-aurora/6 blur-[80px] breathe" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-[30%] right-[30%] w-48 h-48 rounded-full bg-accent/8 blur-[60px] float-slow" />
      </div>

      {/* Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 fade-in">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xl text-foreground">Dream Vault</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/auth")}
          className="text-muted-foreground hover:text-foreground"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Powered by AI • Free to Start</span>
            </div>

            {/* Floating Logo */}
            <div className="fade-in-scale" style={{ animationDelay: "0.2s" }}>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-dream-shimmer/20 mb-8 float border border-primary/20 glow-intense">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-display leading-[0.95] mb-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
              <span className="text-gradient-aurora">Where Dreams</span>
              <br />
              <span className="text-shimmer">Become Reality</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: "0.4s" }}>
              Capture your wildest dreams, harness AI to decode their meaning, 
              and transform visions into actionable life goals.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-in-up" style={{ animationDelay: "0.5s" }}>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-base px-8 py-6 group rounded-xl w-full sm:w-auto"
              >
                Start Your Journey — It's Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dream-gpt")}
                className="text-base px-8 py-6 group border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-xl w-full sm:w-auto"
              >
                <Stars className="w-5 h-5 mr-2 text-primary" />
                Try Dream GPT
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 mt-10 fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex -space-x-2">
                {[
                  "bg-gradient-to-br from-primary to-dream-shimmer",
                  "bg-gradient-to-br from-dream-aurora to-dream-cosmic",
                  "bg-gradient-to-br from-accent to-dream-gold",
                  "bg-gradient-to-br from-dream-sunset to-primary",
                ].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-foreground">
                      {["✦", "♡", "⚡", "☾"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Join <span className="text-foreground font-medium">dreamers</span> worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display text-gradient-aurora mb-3">
                Everything You Need
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                A complete dream management system powered by cutting-edge AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 stagger-in">
              {[
                {
                  icon: Target,
                  title: "Smart Goal Tracking",
                  desc: "Break dreams into milestones with visual progress tracking, priorities, and target dates.",
                  gradient: "from-primary/20 to-dream-shimmer/10",
                  iconColor: "text-primary",
                },
                {
                  icon: Brain,
                  title: "AI Dream Analysis",
                  desc: "Get deep insights, personalized action plans, and motivational guidance from Dream GPT.",
                  gradient: "from-dream-cosmic/20 to-dream-aurora/10",
                  iconColor: "text-dream-cosmic",
                },
                {
                  icon: Stars,
                  title: "Story Generation",
                  desc: "Transform your dreams into vivid narratives with Story GPT's creative storytelling AI.",
                  gradient: "from-accent/20 to-dream-gold/10",
                  iconColor: "text-accent",
                },
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

        {/* How It Works Section */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground">Three steps to transform your dreams</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 stagger-in">
              {[
                {
                  step: "01",
                  icon: Moon,
                  title: "Capture Dreams",
                  desc: "Log your dreams with rich details — categories, priorities, tags, and imagery.",
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: "AI Insights",
                  desc: "Let AI analyze your dreams, suggest action steps, and generate inspiring stories.",
                },
                {
                  step: "03",
                  icon: Compass,
                  title: "Track & Achieve",
                  desc: "Follow milestones, celebrate progress, and connect with a community of dreamers.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="text-center group">
                  <div className="relative inline-block mb-5">
                    <span className="absolute -top-2 -right-2 text-xs font-bold font-sans text-primary bg-primary/10 rounded-full w-7 h-7 flex items-center justify-center border border-primary/30">
                      {step}
                    </span>
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:glow-subtle transition-all duration-500">
                      <Icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More Features Grid */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-in">
              {[
                { icon: Shield, label: "Private & Secure", desc: "Your dreams stay yours" },
                { icon: Users, label: "Social Sharing", desc: "Share selectively" },
                { icon: Star, label: "Favorites & Tags", desc: "Organize easily" },
                { icon: Zap, label: "Instant AI", desc: "No setup required" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass-card p-5 text-center group hover:border-primary/30 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors duration-300" />
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card p-10 md:p-14 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/15 blur-[80px] rounded-full" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-display text-foreground mb-4">
                  Ready to Chase Your
                  <span className="text-gradient-aurora"> Dreams</span>?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Join Dream Vault today and start turning your aspirations into achievements.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary text-base px-10 py-6 group rounded-xl"
                >
                  Create Free Account
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-display">Dream Vault</span>
          </div>
          <p className="text-xs text-muted-foreground">Dream it. Plan it. Achieve it.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
