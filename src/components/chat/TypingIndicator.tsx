import { User } from "@/types/chat";

interface TypingIndicatorProps {
  user: User | undefined;
}

const TypingIndicator = ({ user }: TypingIndicatorProps) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 message-enter">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
        {user.avatar}
      </div>
      <div className="bg-chat-received rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-2">{user.username}</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
