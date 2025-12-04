import { User } from "@/types/chat";

interface OnlineUsersProps {
  users: User[];
}

const OnlineUsers = ({ users }: OnlineUsersProps) => {
  const onlineCount = users.filter((u) => u.isOnline).length;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <span className="w-2.5 h-2.5 bg-online rounded-full animate-pulse" />
        <span className="absolute w-2.5 h-2.5 bg-online rounded-full animate-ping opacity-75" />
      </div>
      <span className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{onlineCount}</span> online
      </span>
    </div>
  );
};

export default OnlineUsers;
