export type Category = 
  | "all"
  | "news"
  | "campus-updates"
  | "academics"
  | "events"
  | "Confessions"
  | "clubs"
  | "placements";

export interface Post {
  id: string;
  content: string;
  username: string;
  avatarInitial: string;
  avatarColor: string;
  category: Category;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote: "up" | "down" | null;
}

export interface TrendingPost {
  id: string;
  title: string;
  category: Category;
  score: number;
}
