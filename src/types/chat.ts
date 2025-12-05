import { Category } from "@/types/post";

export interface ChatMessage {
  id: string;
  username: string;
  content: string;
  avatarColor: string;
  timestamp: number;
  category?: Category;
  likes?: number;
  dislikes?: number;
  userVote?: 'like' | 'dislike' | null;
  commentCount?: number;
}

export interface Comment {
  id: string;
  message_id: string;
  username: string;
  content: string;
  avatarColor: string;
  timestamp: number;
}

export interface User {
  username: string;
  avatarColor: string;
}

export interface TrendingMessage {
  id: string;
  username: string;
  content: string;
  avatarColor: string;
  likes: number;
  timestamp: number;
  category?: Category;
}
