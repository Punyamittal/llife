import { useState } from "react";
import { X, Send } from "lucide-react";
import { Category } from "@/types/post";
import { categories } from "@/data/forumData";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, category: Category) => void;
}

const NewPostModal = ({ isOpen, onClose, onSubmit }: NewPostModalProps) => {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("campus-updates");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), selectedCategory);
      setContent("");
      setSelectedCategory("campus-updates");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Category Selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Select Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== "all")
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts anonymously..."
              rows={4}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Posting as <span className="text-primary font-medium">Anonymous</span>
            </p>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                content.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostModal;
