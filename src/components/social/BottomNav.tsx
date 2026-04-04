import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Plus, Stars, User, Wand2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Plus, label: "Create", path: "/dreams?new=true", isCreate: true },
    { icon: Wand2, label: "Story", path: "/story-creator" },
    { icon: Stars, label: "GPT", path: "/dream-gpt" },
    { icon: User, label: "Profile", path: user ? `/profile/${user.id}` : "/auth" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path, isCreate }) => {
          const isActive = location.pathname === path || (path === "/dashboard" && location.pathname === "/");
          return (
            <Link
              key={label}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-300",
                isCreate
                  ? "relative -mt-5"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCreate ? (
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center glow-primary shadow-lg">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
              )}
              <span className={cn("text-[10px] font-medium", isCreate && "mt-1")}>
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
