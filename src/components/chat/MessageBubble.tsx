import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Message, User, Reaction } from "@/types/chat";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  user: User | undefined;
  isCurrentUser: boolean;
  onReact: (messageId: string, emoji: string) => void;
  isNew?: boolean;
}

const REACTION_EMOJIS = ["❤️", "👍", "😂", "🎉"];

const MessageBubble = ({
  message,
  user,
  isCurrentUser,
  onReact,
  isNew = false,
}: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const timeAgo = formatDistanceToNow(message.timestamp, { addSuffix: true });

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-1 group",
        isCurrentUser ? "flex-row-reverse" : "flex-row",
        isNew && "message-enter"
      )}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-1",
          isCurrentUser
            ? "bg-primary/20 ring-2 ring-primary/30"
            : "bg-secondary"
        )}
      >
        {user?.avatar || "👤"}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Username */}
        <span
          className={cn(
            "text-xs mb-1 px-1",
            isCurrentUser ? "text-primary/80" : "text-muted-foreground"
          )}
        >
          {user?.username || "Anonymous"}
        </span>

        {/* Bubble */}
        <div className="relative">
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl transition-all duration-200",
              isCurrentUser
                ? "bg-chat-sent text-primary-foreground rounded-br-md message-glow-sent hover:message-glow-hover"
                : "bg-chat-received text-foreground rounded-bl-md hover:bg-muted"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Reaction Picker */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-card border border-border rounded-full px-1.5 py-1 shadow-lg transition-all duration-200 z-10",
              isCurrentUser ? "-left-2 -translate-x-full" : "-right-2 translate-x-full",
              showReactions
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            )}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-150 hover:scale-125 text-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Reactions Display */}
        {message.reactions.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {message.reactions.map((reaction: Reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(message.id, reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 hover:scale-105",
                  reaction.userIds.includes("1")
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-secondary hover:bg-muted"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-chat-timestamp mt-1 px-1">
          {timeAgo}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
