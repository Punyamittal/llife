import { Home, TrendingUp, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onNewPost: () => void;
}

const MobileNav = ({ onNewPost }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border lg:hidden">
      <div className="flex items-center justify-around py-2">
        <button className="flex flex-col items-center gap-1 p-2 text-primary">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Trending</span>
        </button>
        <button
          onClick={onNewPost}
          className="flex flex-col items-center gap-1 p-2 -mt-4"
        >
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30">
            <PlusCircle className="w-6 h-6 text-accent-foreground" />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Alerts</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
