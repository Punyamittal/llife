import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

const ChatMessageSkeleton = () => {
  return (
    <article className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </article>
  );
};

interface ChatSkeletonProps {
  count?: number;
  className?: string;
}

const ChatSkeleton = ({ count = 3, className }: ChatSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ChatMessageSkeleton key={index} />
      ))}
    </div>
  );
};

export { ChatMessageSkeleton, ChatSkeleton };

