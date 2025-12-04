export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
  reactions: Reaction[];
}
