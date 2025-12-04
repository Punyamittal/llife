import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Message, User } from "@/types/chat";
import {
  mockUsers,
  mockMessages,
  currentUserId,
  simulatedMessages,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [users] = useState<User[]>(mockUsers);
  const [typingUser, setTypingUser] = useState<User | undefined>(undefined);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const simulationIndexRef = useRef(0);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Check if scrolled to bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, scrollToBottom]);

  // Simulate incoming messages
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const interval = setInterval(() => {
      const simMsg = simulatedMessages[simulationIndexRef.current % simulatedMessages.length];
      const user = users.find((u) => u.id === simMsg.userId);

      // Show typing indicator
      setTypingUser(user);

      // Add message after delay
      setTimeout(() => {
        setTypingUser(undefined);
        const newMessage: Message = {
          id: `sim-${Date.now()}`,
          content: simMsg.content,
          userId: simMsg.userId,
          timestamp: new Date(),
          reactions: [],
        };
        setMessages((prev) => [...prev, newMessage]);
        setNewMessageIds((prev) => new Set(prev).add(newMessage.id));

        // Remove animation class after animation completes
        setTimeout(() => {
          setNewMessageIds((prev) => {
            const next = new Set(prev);
            next.delete(newMessage.id);
            return next;
          });
        }, 400);

        simulationIndexRef.current++;
      }, 2000);
    }, 12000);

    return () => clearInterval(interval);
  }, [isOpen, isMinimized, users]);

  // Send message
  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      userId: currentUserId,
      timestamp: new Date(),
      reactions: [],
    };
    setMessages((prev) => [...prev, newMessage]);
    setNewMessageIds((prev) => new Set(prev).add(newMessage.id));
    setTimeout(() => scrollToBottom(), 50);

    setTimeout(() => {
      setNewMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(newMessage.id);
        return next;
      });
    }, 400);
  };

  // Handle reaction
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          const hasReacted = existingReaction.userIds.includes(currentUserId);
          if (hasReacted) {
            // Remove reaction
            const newUserIds = existingReaction.userIds.filter(
              (id) => id !== currentUserId
            );
            if (newUserIds.length === 0) {
              return {
                ...msg,
                reactions: msg.reactions.filter((r) => r.emoji !== emoji),
              };
            }
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, userIds: newUserIds }
                  : r
              ),
            };
          } else {
            // Add to existing reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      userIds: [...r.userIds, currentUserId],
                    }
                  : r
              ),
            };
          }
        } else {
          // Create new reaction
          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              { emoji, count: 1, userIds: [currentUserId] },
            ],
          };
        }
      })
    );
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 chat-panel-enter"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {messages.length}
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-lg chat-glow hover:scale-105 transition-all duration-300"
      >
        <div className="relative">
          <span className="font-display font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Vhispers
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-online rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            {users.filter((u) => u.isOnline).length}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)]",
        "bg-card border border-border rounded-xl shadow-2xl chat-glow",
        "flex flex-col overflow-hidden chat-panel-enter noise-texture",
        "md:w-[400px] md:h-[600px]"
      )}
    >
      {/* Noise overlay positioned correctly */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <ChatHeader
          users={users}
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized(true)}
        />

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-2"
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              user={users.find((u) => u.id === message.userId)}
              isCurrentUser={message.userId === currentUserId}
              onReact={handleReaction}
              isNew={newMessageIds.has(message.id)}
            />
          ))}

          {/* Typing Indicator */}
          {typingUser && <TypingIndicator user={typingUser} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 p-2 bg-accent text-accent-foreground rounded-full shadow-lg scroll-btn-pulse hover:scale-110 transition-transform duration-200"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Input */}
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPanel;
