import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, MessageCircle, Share2, MoreHorizontal, FileText } from "lucide-react";
import { Post, Category } from "@/types/post";
import { categories } from "@/data/forumData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: Post;
  onVote: (postId: string, vote: "up" | "down") => void;
  isNew?: boolean;
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

const PostCard = ({ post, onVote, isNew = false }: PostCardProps) => {
  const category = categories.find((c) => c.id === post.category);
  const timeAgo = formatDistanceToNow(post.timestamp, { addSuffix: true });
  const score = post.upvotes - post.downvotes;
  const { toast } = useToast();

  const handleShare = async () => {
    const postUrl = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    
    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.username}`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: postUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch (error) {
      // Silently fail
    }
  };

  return (
    <article
      className={cn(
        "bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary/30",
        isNew && "animate-fade-in"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5",
              categoryColors[post.category]
            )}
          >
            {category?.icon && <category.icon className="w-3.5 h-3.5" />}
            {category?.label}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            {timeAgo}
          </span>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
            post.avatarColor
          )}
        >
          {post.avatarInitial}
        </div>
        <span className="text-sm font-medium text-primary">{post.username}</span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-2 mb-4">
        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap flex-1">
          {post.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Voting */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg">
            <button
              onClick={() => onVote(post.id, "up")}
              className={cn(
                "p-2 rounded-l-lg transition-colors",
                post.userVote === "up"
                  ? "text-primary bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span
              className={cn(
                "text-sm font-medium min-w-[2rem] text-center",
                score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {score > 0 ? `+${score}` : score}
            </span>
            <button
              onClick={() => onVote(post.id, "down")}
              className={cn(
                "p-2 rounded-r-lg transition-colors",
                post.userVote === "down"
                  ? "text-destructive bg-destructive/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Comments */}
          <button className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.commentCount}</span>
          </button>
        </div>

        {/* Share */}
        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Share</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
