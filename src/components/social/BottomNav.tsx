import { Link, useLocation } from "react-router-dom";
import { Home, Users, Plus, Stars, User, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: Plus, label: "Create", path: "/dreams?new=true", isCreate: true },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: Stars, label: "GPT", path: "/dream-gpt" },
    { icon: User, label: "Profile", path: user ? `/profile/${user.id}` : "/auth" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
      <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-1">
        {navItems.map(({ icon: Icon, label, path, isCreate }) => {
          const isActive = location.pathname === path || (path === "/dashboard" && location.pathname === "/");
          return (
            <Link
              key={label}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative",
                isCreate
                  ? "relative -mt-4"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCreate ? (
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={cn(
                    "w-[22px] h-[22px] transition-all duration-200",
                    isActive && "scale-105"
                  )} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              )}
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isCreate && "mt-0.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
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
