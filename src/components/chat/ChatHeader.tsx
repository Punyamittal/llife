import { X, Minimize2 } from "lucide-react";
import { User } from "@/types/chat";
import OnlineUsers from "./OnlineUsers";

interface ChatHeaderProps {
  users: User[];
  onClose: () => void;
  onMinimize: () => void;
}

const ChatHeader = ({ users, onClose, onMinimize }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <h2 className="font-display text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Vhispers
          </h2>
          <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <span className="text-muted-foreground">•</span>
        <OnlineUsers users={users} />
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
          aria-label="Minimize chat"
        >
          <Minimize2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
          aria-label="Close chat"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
