import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-end gap-2 bg-input rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm px-2 py-1.5",
            "min-h-[36px] max-h-[120px]"
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || disabled}
          className={cn(
            "p-2.5 rounded-lg transition-all duration-200 shrink-0",
            content.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-secondary rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-secondary rounded text-[9px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default MessageInput;
