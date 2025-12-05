import { TrendingUp, AlertCircle, ShieldCheck } from "lucide-react";
import { TrendingPost, Category } from "@/types/post";
import { categories, guidelines } from "@/data/forumData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onlineCount: number;
  postsToday: number;
  trending: TrendingPost[];
}

const categoryColors: Record<Category, string> = {
  all: "bg-primary/20 text-primary",
  news: "bg-blue-500/20 text-blue-400",
  "campus-updates": "bg-orange-500/20 text-orange-400",
  academics: "bg-emerald-500/20 text-emerald-400",
  events: "bg-pink-500/20 text-pink-400",
  Conffesions: "bg-purple-500/20 text-purple-400",
  clubs: "bg-cyan-500/20 text-cyan-400",
  placements: "bg-amber-500/20 text-amber-400",
};

const Sidebar = ({ onlineCount, postsToday, trending }: SidebarProps) => {
  return (
    <aside className="w-80 shrink-0 space-y-4">
      {/* Trending */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-medium">Trending Now</span>
        </div>
        <div className="space-y-3">
          {trending.map((post, index) => {
            const cat = categories.find((c) => c.id === post.category);
            return (
              <div
                key={post.id}
                className="flex items-start gap-3 group cursor-pointer"
              >
                <span className="text-lg font-bold text-muted-foreground w-5 shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium",
                        categoryColors[post.category]
                      )}
                    >
                      {cat?.label}
                    </span>
                    <span className="text-[10px] text-primary">+{post.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="font-medium">Guidelines</span>
        </div>
        <ul className="space-y-2">
          {guidelines.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
