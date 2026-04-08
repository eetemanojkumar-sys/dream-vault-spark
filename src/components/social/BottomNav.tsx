import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Plus, Stars, User, Wand2, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [ripple, setRipple] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Plus, label: "Create", path: "/dreams?new=true", isCreate: true },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: Stars, label: "GPT", path: "/dream-gpt" },
    { icon: User, label: "Profile", path: user ? `/profile/${user.id}` : "/auth" },
  ];

  const handleTap = (label: string) => {
    setRipple(label);
    setTimeout(() => setRipple(null), 400);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path, isCreate }) => {
          const isActive = location.pathname === path || (path === "/dashboard" && location.pathname === "/");
          return (
            <Link
              key={label}
              to={path}
              onClick={() => handleTap(label)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-300 relative",
                isCreate
                  ? "relative -mt-5"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Ripple effect */}
              {ripple === label && !isCreate && (
                <span className="absolute inset-0 rounded-xl bg-primary/10 animate-[scaleIn_0.4s_ease-out_forwards] pointer-events-none" />
              )}
              {isCreate ? (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-dream-shimmer flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))] scale-110"
                  )} />
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              )}
              <span className={cn("text-[10px] font-medium transition-all", isCreate && "mt-1", isActive && "text-primary")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
