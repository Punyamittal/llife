import { useState, useEffect, useRef } from "react";
import { ChatMessage, User, Comment, TrendingMessage } from "@/types/chat";
import { Category } from "@/types/post";
import { categories, guidelines } from "@/data/forumData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, MessageCircle, Search, ChevronUp, ChevronDown, TrendingUp, MoreHorizontal, Flag, AlertTriangle, Flame, AlertCircle, Plus, ShieldCheck, Share2, User as UserIcon, ScrollText, Trash2, Lock } from "lucide-react";
import { ChatSkeleton } from "@/components/ui/chat-skeleton";
import NewPostModal from "@/components/forum/NewPostModal";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Username generation
const adjectives = [
  'Mystic', 'Silent', 'Cryptic', 'Neon', 'Pixel', 'Cosmic', 'Digital', 'Quantum',
  'Shadow', 'Storm', 'Phoenix', 'Dreamer', 'Wanderer', 'Voyager', 'Explorer',
  'Nova', 'Echo', 'Aurora', 'Zenith', 'Lunar', 'Solar', 'Stellar', 'Nebula'
];

const nouns = [
  'Phoenix', 'Storm', 'Shadow', 'Dreamer', 'Wanderer', 'Voyager', 'Explorer',
  'Nova', 'Echo', 'Aurora', 'Zenith', 'Lunar', 'Solar', 'Stellar', 'Nebula',
  'Falcon', 'Wolf', 'Eagle', 'Tiger', 'Dragon', 'Lion', 'Bear', 'Hawk'
];

const colors = [
  'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600',
  'bg-red-600', 'bg-yellow-600', 'bg-indigo-600', 'bg-teal-600', 'bg-cyan-600'
];

function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 10000);
  return `${adj}${noun}${num}`;
}

function generateAvatarColor() {
  // Randomly select from d1 to d8 (d1-d6 and d8 are .webp, d7 is .jpg)
  const avatarNumber = Math.floor(Math.random() * 8) + 1;
  const extension = avatarNumber === 7 ? 'jpg' : 'webp';
  return `/d${avatarNumber}.${extension}`;
}

function getAvatarFromUsername(username: string): string {
  // Generate consistent avatar based on username hash
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarNumber = (hash % 8) + 1;
  const extension = avatarNumber === 7 ? 'jpg' : 'webp';
  return `/d${avatarNumber}.${extension}`;
}

function getAvatarNumberFromPath(avatarPath: string): number {
  // Extract avatar number from path like "/d3.webp" or "/d7.jpg"
  const match = avatarPath.match(/\/d(\d+)\./);
  return match ? parseInt(match[1], 10) : 1;
}


function getAvatarColorScheme(avatarNumber: number) {
  // Color schemes for each avatar (d1-d8)
  const schemes: Record<number, {
    glow: { from: string; via: string; to: string };
    textShadow: string;
    boxShadow: string;
  }> = {
    1: {
      glow: { from: 'from-red-500', via: 'via-red-600', to: 'to-red-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(239, 68, 68, 0.7), 0 0 20px rgba(220, 38, 38, 0.5)',
      boxShadow: '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(220, 38, 38, 0.6), 0 0 90px rgba(239, 68, 68, 0.4)'
    },
    2: {
      glow: { from: 'from-gray-500', via: 'via-gray-600', to: 'to-gray-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(107, 114, 128, 0.7), 0 0 20px rgba(75, 85, 99, 0.5)',
      boxShadow: '0 0 30px rgba(107, 114, 128, 0.8), 0 0 60px rgba(75, 85, 99, 0.6), 0 0 90px rgba(107, 114, 128, 0.4)'
    },
    3: {
      glow: { from: 'from-purple-500', via: 'via-purple-600', to: 'to-purple-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(168, 85, 247, 0.7), 0 0 20px rgba(147, 51, 234, 0.5)',
      boxShadow: '0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(147, 51, 234, 0.6), 0 0 90px rgba(168, 85, 247, 0.4)'
    },
    4: {
      glow: { from: 'from-green-500', via: 'via-green-600', to: 'to-green-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(34, 197, 94, 0.7), 0 0 20px rgba(22, 163, 74, 0.5)',
      boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(22, 163, 74, 0.6), 0 0 90px rgba(34, 197, 94, 0.4)'
    },
    5: {
      glow: { from: 'from-white', via: 'via-gray-200', to: 'to-white' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 255, 255, 0.7), 0 0 20px rgba(229, 231, 235, 0.5)',
      boxShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(229, 231, 235, 0.6), 0 0 90px rgba(255, 255, 255, 0.4)'
    },
    6: {
      glow: { from: 'from-red-500', via: 'via-red-600', to: 'to-red-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(239, 68, 68, 0.7), 0 0 20px rgba(220, 38, 38, 0.5)',
      boxShadow: '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(220, 38, 38, 0.6), 0 0 90px rgba(239, 68, 68, 0.4)'
    },
    7: {
      glow: { from: 'from-gray-500', via: 'via-gray-600', to: 'to-gray-500' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(107, 114, 128, 0.7), 0 0 20px rgba(75, 85, 99, 0.5)',
      boxShadow: '0 0 30px rgba(107, 114, 128, 0.8), 0 0 60px rgba(75, 85, 99, 0.6), 0 0 90px rgba(107, 114, 128, 0.4)'
    },
    8: {
      glow: { from: 'from-stone-200', via: 'via-stone-100', to: 'to-stone-200' },
      textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(245, 245, 244, 0.7), 0 0 20px rgba(231, 229, 228, 0.5)',
      boxShadow: '0 0 30px rgba(245, 245, 244, 0.8), 0 0 60px rgba(231, 229, 228, 0.6), 0 0 90px rgba(245, 245, 244, 0.4)'
    }
  };
  return schemes[avatarNumber] || schemes[1];
}

function getSessionId() {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingMessages, setTrendingMessages] = useState<TrendingMessage[]>([]);
  const [reportedMessages, setReportedMessages] = useState<Set<string>>(new Set());
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [messageToReport, setMessageToReport] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [creatorDialogOpen, setCreatorDialogOpen] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showLegendaryAvatars, setShowLegendaryAvatars] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());
  
  // Admin access state
  const [weekClickCount, setWeekClickCount] = useState(0);
  const [adminLoginDialogOpen, setAdminLoginDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  
  // Super Powers State
  const [colorMasterActive, setColorMasterActive] = useState(false);
  const [echoChamberActive, setEchoChamberActive] = useState(false);
  const [ghostWriterActive, setGhostWriterActive] = useState(false);
  const [avatarChangeHistory, setAvatarChangeHistory] = useState<number[]>([]);
  const [selfReplyCount, setSelfReplyCount] = useState(0);
  const [lastSelfReplyMessageId, setLastSelfReplyMessageId] = useState<string | null>(null);
  const [devilTypingCount, setDevilTypingCount] = useState(0);
  const [lastDevilTypingTime, setLastDevilTypingTime] = useState<number>(0);
  
  // Rate limiting state
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [commentTimestamps, setCommentTimestamps] = useState<number[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>("");
  
  // Duplicate post prevention: track recent message contents
  const [recentMessageContents, setRecentMessageContents] = useState<Array<{ content: string; timestamp: number }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionIdRef = useRef<string>("");
  const colorMasterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const echoChamberTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ghostWriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function initializeChat() {
      try {
        const sessionId = getSessionId();
        sessionIdRef.current = sessionId;

        // Get or create user
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (userError && userError.code === 'PGRST116') {
          const username = generateUsername();
          const avatarColor = generateAvatarColor();

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              session_id: sessionId,
              username,
              avatar_color: avatarColor,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
            return;
          }

          userData = newUser;
        } else if (userError) {
          console.error('Error fetching user:', userError);
          return;
        } else {
          await supabase
            .from('users')
            .update({ last_seen: new Date().toISOString() })
            .eq('session_id', sessionId);
        }

        if (mounted && userData) {
          // Normalize avatar path - convert old formats to new format if needed
          let avatarPath = userData.avatar_color;
          if (avatarPath && (avatarPath.startsWith('bg-') || !avatarPath.startsWith('/'))) {
            // Old format - generate consistent avatar based on username hash
            const hash = userData.username.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const avatarNumber = (hash % 8) + 1;
            const extension = avatarNumber === 7 ? 'jpg' : 'webp';
            avatarPath = `/d${avatarNumber}.${extension}`;
            
            // Update database with normalized avatar
            await supabase
              .from('users')
              .update({ avatar_color: avatarPath })
              .eq('session_id', sessionId);
          }
          
          setUser({
            username: userData.username,
            avatarColor: avatarPath || getAvatarFromUsername(userData.username),
          });
        }

        // Fetch recent messages with vote counts
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }

        if (mounted && messagesData) {
          // Get vote counts for each message
          const messageIds = messagesData.map(m => m.id);
          const { data: votesData } = await supabase
            .from('message_votes')
            .select('*')
            .in('message_id', messageIds);

          // Get user's votes
          const { data: userVotes } = await supabase
            .from('message_votes')
            .select('*')
            .eq('session_id', sessionId)
            .in('message_id', messageIds);

          // Get comment counts
          const { data: commentsData } = await supabase
            .from('comments')
            .select('message_id')
            .in('message_id', messageIds);

          const commentCounts: Record<string, number> = {};
          commentsData?.forEach(c => {
            commentCounts[c.message_id] = (commentCounts[c.message_id] || 0) + 1;
          });

          const votesByMessage: Record<string, { likes: number; dislikes: number }> = {};
          votesData?.forEach(v => {
            if (!votesByMessage[v.message_id]) {
              votesByMessage[v.message_id] = { likes: 0, dislikes: 0 };
            }
            if (v.vote_type === 'like') votesByMessage[v.message_id].likes++;
            else votesByMessage[v.message_id].dislikes++;
          });

          const userVoteMap: Record<string, 'like' | 'dislike'> = {};
          userVotes?.forEach(v => {
            userVoteMap[v.message_id] = v.vote_type as 'like' | 'dislike';
          });

          // Get user's reported messages
          const { data: userReports } = await supabase
            .from('reports')
            .select('message_id')
            .eq('session_id', sessionId);

          if (userReports && mounted) {
            setReportedMessages(new Set(userReports.map(r => r.message_id)));
          }

          const formattedMessages = messagesData
            .map((msg) => {
              // Convert old color-based avatars to image paths if needed
              let avatarPath = msg.avatar_color;
              if (avatarPath && (avatarPath.startsWith('bg-') || !avatarPath.startsWith('/'))) {
                // Old format - generate a random avatar based on username hash for consistency
                const hash = msg.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const avatarNumber = (hash % 8) + 1;
                const extension = avatarNumber === 7 ? 'jpg' : 'webp';
                avatarPath = `/d${avatarNumber}.${extension}`;
              }
              
              return {
                id: msg.id,
                username: msg.username,
                content: msg.content,
                avatarColor: avatarPath || '/d1.webp',
                timestamp: new Date(msg.created_at).getTime(),
                category: (msg.category as Category) || 'all',
                likes: votesByMessage[msg.id]?.likes || 0,
                dislikes: votesByMessage[msg.id]?.dislikes || 0,
                userVote: userVoteMap[msg.id] || null,
                commentCount: commentCounts[msg.id] || 0,
              };
            });
          setMessages(formattedMessages);
          if (mounted) setIsLoading(false);
        }

        // Fetch comments for all messages
        const { data: allComments } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: true });

        if (allComments && mounted) {
          const commentsByMessage: Record<string, Comment[]> = {};
          allComments.forEach(comment => {
            if (!commentsByMessage[comment.message_id]) {
              commentsByMessage[comment.message_id] = [];
            }
            // Convert old color-based avatars to image paths if needed
          let avatarPath = comment.avatar_color;
          if (avatarPath && (avatarPath.startsWith('bg-') || !avatarPath.startsWith('/'))) {
            const hash = comment.username.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const avatarNumber = (hash % 8) + 1;
            const extension = avatarNumber === 7 ? 'jpg' : 'webp';
            avatarPath = `/d${avatarNumber}.${extension}`;
          }
          
          commentsByMessage[comment.message_id].push({
              id: comment.id,
              message_id: comment.message_id,
              username: comment.username,
              content: comment.content,
              avatarColor: avatarPath || '/d1.webp',
              timestamp: new Date(comment.created_at).getTime(),
            });
          });
          setComments(commentsByMessage);
        }

        // Fetch trending messages (top 5 by likes)
        const { data: trendingData } = await supabase
          .from('messages')
          .select(`
            *,
            message_votes!inner(vote_type)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (trendingData && mounted) {
          const messageLikes: Record<string, { message: any; likes: number }> = {};
          trendingData.forEach((msg: any) => {
            if (!messageLikes[msg.id]) {
              messageLikes[msg.id] = { message: msg, likes: 0 };
            }
            if (msg.message_votes?.some((v: any) => v.vote_type === 'like')) {
              messageLikes[msg.id].likes++;
            }
          });

          const trending = Object.values(messageLikes)
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 5)
            .map(item => ({
              id: item.message.id,
              username: item.message.username,
              content: item.message.content,
              avatarColor: item.message.avatar_color,
              likes: item.likes,
              timestamp: new Date(item.message.created_at).getTime(),
              category: item.message.category as Category | undefined,
            }));
          setTrendingMessages(trending);
        }

        // Subscribe to real-time updates
        const channel = supabase
          .channel('chat-updates')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            async (payload) => {
              if (mounted) {
                const newMessage = payload.new as any;
                // Convert old color-based avatars to image paths if needed
                let avatarPath = newMessage.avatar_color;
                if (avatarPath && (avatarPath.startsWith('bg-') || !avatarPath.startsWith('/'))) {
                  const hash = newMessage.username.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                  const avatarNumber = (hash % 8) + 1;
                  const extension = avatarNumber === 7 ? 'jpg' : 'webp';
                  avatarPath = `/d${avatarNumber}.${extension}`;
                }
                
                const newMsg: ChatMessage = {
                  id: newMessage.id,
                  username: newMessage.username,
                  content: newMessage.content,
                  avatarColor: avatarPath || '/d1.webp',
                  timestamp: new Date(newMessage.created_at).getTime(),
                  category: (newMessage.category as Category) || 'all',
                  likes: 0,
                  dislikes: 0,
                  userVote: null,
                  commentCount: 0,
                };
                setMessages((prev) => [newMsg, ...prev]);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'comments' },
            (payload) => {
              if (mounted) {
                const newComment = payload.new as any;
                // Convert old color-based avatars to image paths if needed
                let avatarPath = newComment.avatar_color;
                if (avatarPath && (avatarPath.startsWith('bg-') || !avatarPath.startsWith('/'))) {
                  const hash = newComment.username.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                  const avatarNumber = (hash % 8) + 1;
                  const extension = avatarNumber === 7 ? 'jpg' : 'webp';
                  avatarPath = `/d${avatarNumber}.${extension}`;
                }
                
                const comment: Comment = {
                  id: newComment.id,
                  message_id: newComment.message_id,
                  username: newComment.username,
                  content: newComment.content,
                  avatarColor: avatarPath || '/d1.webp',
                  timestamp: new Date(newComment.created_at).getTime(),
                };
                setComments((prev) => ({
                  ...prev,
                  [newComment.message_id]: [...(prev[newComment.message_id] || []), comment],
                }));
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newComment.message_id
                      ? { ...msg, commentCount: (msg.commentCount || 0) + 1 }
                      : msg
                  )
                );
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'message_votes' },
            (payload) => {
              if (mounted) {
                const newVote = payload.new as any;
                const isUserVote = newVote.session_id === sessionId;
                
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === newVote.message_id) {
                      // Only update if this is not from current user (to avoid double-counting optimistic updates)
                      // For other users' votes, always increment
                      if (!isUserVote) {
                        return {
                          ...msg,
                          likes: newVote.vote_type === 'like' 
                            ? (msg.likes || 0) + 1 
                            : (msg.likes || 0),
                          dislikes: newVote.vote_type === 'dislike' 
                            ? (msg.dislikes || 0) + 1 
                            : (msg.dislikes || 0),
                        };
                      } else {
                        // For current user, ensure userVote matches (counts already updated optimistically)
                        // Only update if userVote doesn't match to handle edge cases
                        if (msg.userVote !== newVote.vote_type) {
                          return {
                            ...msg,
                            userVote: newVote.vote_type as 'like' | 'dislike',
                          };
                        }
                      }
                    }
                    return msg;
                  })
                );
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'message_votes' },
            (payload) => {
              if (mounted) {
                const deletedVote = payload.old as any;
                const isUserVote = deletedVote.session_id === sessionId;
                
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === deletedVote.message_id) {
                      if (!isUserVote) {
                        // Other user removed their vote
                        return {
                          ...msg,
                          likes: deletedVote.vote_type === 'like' 
                            ? Math.max(0, (msg.likes || 0) - 1)
                            : (msg.likes || 0),
                          dislikes: deletedVote.vote_type === 'dislike' 
                            ? Math.max(0, (msg.dislikes || 0) - 1)
                            : (msg.dislikes || 0),
                        };
                      } else {
                        // Current user removed their vote (counts already updated optimistically)
                        return {
                          ...msg,
                          userVote: null,
                        };
                      }
                    }
                    return msg;
                  })
                );
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'message_votes' },
            (payload) => {
              if (mounted) {
                const updatedVote = payload.new as any;
                const oldVote = payload.old as any;
                const isUserVote = updatedVote.session_id === sessionId;
                
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === updatedVote.message_id) {
                      if (!isUserVote) {
                        // Other user changed their vote
                        let newLikes = msg.likes || 0;
                        let newDislikes = msg.dislikes || 0;
                        
                        // Remove old vote
                        if (oldVote.vote_type === 'like') {
                          newLikes = Math.max(0, newLikes - 1);
                        } else {
                          newDislikes = Math.max(0, newDislikes - 1);
                        }
                        
                        // Add new vote
                        if (updatedVote.vote_type === 'like') {
                          newLikes = newLikes + 1;
                        } else {
                          newDislikes = newDislikes + 1;
                        }
                        
                        return {
                          ...msg,
                          likes: newLikes,
                          dislikes: newDislikes,
                        };
                      } else {
                        // Current user changed vote (counts already updated optimistically)
                        return {
                          ...msg,
                          userVote: updatedVote.vote_type as 'like' | 'dislike',
                        };
                      }
                    }
                    return msg;
                  })
                );
              }
            }
          )
          .subscribe();

        channelRef.current = channel;

        // Update online count
        const updateOnlineCount = async () => {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('last_seen', fiveMinutesAgo);

          if (mounted) setOnlineCount(count || 0);
        };

        updateOnlineCount();
        const onlineInterval = setInterval(updateOnlineCount, 30000);
        const lastSeenInterval = setInterval(async () => {
          if (sessionIdRef.current) {
            await supabase
              .from('users')
              .update({ last_seen: new Date().toISOString() })
              .eq('session_id', sessionIdRef.current);
          }
        }, 60000);

        return () => {
          clearInterval(onlineInterval);
          clearInterval(lastSeenInterval);
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (mounted) setIsLoading(false);
      }
    }

    initializeChat();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      // Cleanup super power timers
      if (colorMasterTimerRef.current) {
        clearTimeout(colorMasterTimerRef.current);
      }
      if (echoChamberTimerRef.current) {
        clearTimeout(echoChamberTimerRef.current);
      }
      if (ghostWriterTimerRef.current) {
        clearTimeout(ghostWriterTimerRef.current);
      }
    };
  }, []);

  // Cleanup old rate limit timestamps and duplicate post tracking every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps(prev => prev.filter(timestamp => now - timestamp < 30000));
      setCommentTimestamps(prev => prev.filter(timestamp => now - timestamp < 30000));
      // Clean up message contents older than 10 minutes
      setRecentMessageContents(prev => prev.filter(item => now - item.timestamp < 10 * 60 * 1000));
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Removed auto-scroll since newest messages are now on top

  const handleNewPost = async (content: string, category: Category) => {
    if (!content.trim() || !user) return;

    // Rate limiting: Max 5 messages per 30 seconds
    const now = Date.now();
    const recentMessages = messageTimestamps.filter(timestamp => now - timestamp < 30000); // 30 seconds
    
    if (recentMessages.length >= 5) {
      const timeRemaining = Math.ceil((30000 - (now - recentMessages[0])) / 1000);
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${timeRemaining} seconds before posting again. Maximum 5 messages per 30 seconds.`,
        variant: "destructive",
      });
      return;
    }

    // Update message timestamps
    setMessageTimestamps(prev => [...prev.filter(t => now - t < 30000), now]);

    // Duplicate post prevention: Check if same content was posted in last 10 minutes
    const trimmedContent = content.trim().toLowerCase();
    const tenMinutesAgo = now - (10 * 60 * 1000); // 10 minutes
    const recentContents = recentMessageContents.filter(
      item => item.timestamp > tenMinutesAgo
    );
    
    const isDuplicate = recentContents.some(
      item => item.content.toLowerCase() === trimmedContent
    );
    
    if (isDuplicate) {
      const oldestDuplicate = recentContents.find(
        item => item.content.toLowerCase() === trimmedContent
      );
      if (oldestDuplicate) {
        const timeRemaining = Math.ceil((10 * 60 * 1000 - (now - oldestDuplicate.timestamp)) / 1000 / 60);
        toast({
          title: "Duplicate Post Detected",
          description: `You've already posted this message. Please wait ${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''} before posting the same content again.`,
          variant: "destructive",
        });
      }
      return;
    }

    // Update recent message contents
    setRecentMessageContents(prev => [
      ...prev.filter(item => item.timestamp > tenMinutesAgo),
      { content: trimmedContent, timestamp: now }
    ]);

    // Ghost Writer Activation: Type "devil" 3 times in a row
    const lowerText = content.toLowerCase();
    const devilMatches = lowerText.match(/devil/g);
    if (devilMatches && devilMatches.length >= 3) {
      const now = Date.now();
      if (now - lastDevilTypingTime < 5000) { // Within 5 seconds
        const newCount = devilTypingCount + 1;
        setDevilTypingCount(newCount);
        setLastDevilTypingTime(now);
        
        if (newCount >= 3 && !ghostWriterActive) {
          // Activate Ghost Writer for 5 minutes
          setGhostWriterActive(true);
          if (ghostWriterTimerRef.current) {
            clearTimeout(ghostWriterTimerRef.current);
          }
          ghostWriterTimerRef.current = setTimeout(() => {
            setGhostWriterActive(false);
            toast({
              title: "Ghost Writer Expired",
              description: "Your special message styling has ended.",
              variant: "default",
            });
          }, 5 * 60 * 1000); // 5 minutes
          
          toast({
            title: "👻 Ghost Writer Activated!",
            description: "Your messages will have special styling for 5 minutes!",
            variant: "default",
          });
        }
      } else {
        setDevilTypingCount(1);
        setLastDevilTypingTime(now);
      }
    }

    try {
      const { error } = await supabase.from('messages').insert({
        username: user.username,
        content: content.trim(),
        avatar_color: user.avatarColor,
        category: category,
      });

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (messageId: string, voteType: 'like' | 'dislike') => {
    if (!sessionIdRef.current || !user) return;
    
    // Prevent multiple simultaneous votes on the same message
    if (votingInProgress.has(messageId)) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const currentVote = message.userVote;
    
    // Determine new vote state
    let newVote: 'like' | 'dislike' | null;
    if (currentVote === voteType) {
      // Toggle off - remove vote
      newVote = null;
    } else {
      // Change vote or add new vote
      newVote = voteType;
    }

    // Mark as voting in progress
    setVotingInProgress(prev => new Set(prev).add(messageId));

    // Store original state for rollback
    const originalLikes = message.likes || 0;
    const originalDislikes = message.dislikes || 0;
    const originalUserVote = message.userVote;

    // Optimistic update - update UI immediately with correct counts
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          let newLikes = msg.likes || 0;
          let newDislikes = msg.dislikes || 0;

          // Remove current vote if exists
          if (currentVote === 'like') {
            newLikes = Math.max(0, newLikes - 1);
          } else if (currentVote === 'dislike') {
            newDislikes = Math.max(0, newDislikes - 1);
          }

          // Add new vote if not null
          if (newVote === 'like') {
            newLikes = newLikes + 1;
          } else if (newVote === 'dislike') {
            newDislikes = newDislikes + 1;
          }

          return {
            ...msg,
            likes: newLikes,
            dislikes: newDislikes,
            userVote: newVote,
          };
        }
        return msg;
      })
    );

    // Update database
    try {
      if (newVote === null) {
        // Remove vote
        const { error } = await supabase
          .from('message_votes')
          .delete()
          .eq('message_id', messageId)
          .eq('session_id', sessionIdRef.current);
        
        if (error) {
          console.error('Error removing vote:', error);
          // Revert optimistic update on error
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  likes: originalLikes,
                  dislikes: originalDislikes,
                  userVote: originalUserVote,
                };
              }
              return msg;
            })
          );
        }
      } else {
        // Upsert vote (insert or update)
        const { error } = await supabase
          .from('message_votes')
          .upsert({
            message_id: messageId,
            session_id: sessionIdRef.current,
            vote_type: newVote,
          }, {
            onConflict: 'message_id,session_id'
          });
        
        if (error) {
          console.error('Error updating vote:', error);
          // Revert optimistic update on error
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  likes: originalLikes,
                  dislikes: originalDislikes,
                  userVote: originalUserVote,
                };
              }
              return msg;
            })
          );
        }
      }
    } catch (error) {
      console.error('Error in handleVote:', error);
      // Revert optimistic update on error
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              likes: originalLikes,
              dislikes: originalDislikes,
              userVote: originalUserVote,
            };
          }
          return msg;
        })
      );
    } finally {
      // Remove from voting in progress after a short delay to prevent rapid clicks
      setTimeout(() => {
        setVotingInProgress(prev => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }, 300);
    }
  };

  const handleComment = async (messageId: string) => {
    const commentText = commentInputs[messageId]?.trim();
    if (!commentText || !user) return;

    // Rate limiting: Max 10 comments per 30 seconds
    const now = Date.now();
    const recentComments = commentTimestamps.filter(timestamp => now - timestamp < 30000); // 30 seconds
    
    if (recentComments.length >= 10) {
      const timeRemaining = Math.ceil((30000 - (now - recentComments[0])) / 1000);
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${timeRemaining} seconds before commenting again. Maximum 10 comments per 30 seconds.`,
        variant: "destructive",
      });
      return;
    }

    // Update comment timestamps
    setCommentTimestamps(prev => [...prev.filter(t => now - t < 30000), now]);

    // Echo Chamber Activation: Reply to your own message 3 times
    const message = messages.find(m => m.id === messageId);
    if (message && message.username === user.username) {
      if (lastSelfReplyMessageId === messageId) {
        const newCount = selfReplyCount + 1;
        setSelfReplyCount(newCount);
        
        if (newCount >= 3 && !echoChamberActive) {
          // Activate Echo Chamber for 1 minute
          setEchoChamberActive(true);
          if (echoChamberTimerRef.current) {
            clearTimeout(echoChamberTimerRef.current);
          }
          echoChamberTimerRef.current = setTimeout(() => {
            setEchoChamberActive(false);
            toast({
              title: "Echo Chamber Expired",
              description: "Your messages are no longer auto-pinned.",
              variant: "default",
            });
          }, 60 * 1000); // 1 minute
          
          toast({
            title: "🔊 Echo Chamber Activated!",
            description: "Your messages will be pinned to top for 1 minute!",
            variant: "default",
          });
        }
      } else {
        setSelfReplyCount(1);
        setLastSelfReplyMessageId(messageId);
      }
    } else {
      setSelfReplyCount(0);
      setLastSelfReplyMessageId(null);
    }

    // Ghost Writer Activation: Type "devil" 3 times in a row
    const lowerText = commentText.toLowerCase();
    const devilMatches = lowerText.match(/devil/g);
    if (devilMatches && devilMatches.length >= 3) {
      const now = Date.now();
      if (now - lastDevilTypingTime < 5000) { // Within 5 seconds
        const newCount = devilTypingCount + 1;
        setDevilTypingCount(newCount);
        setLastDevilTypingTime(now);
        
        if (newCount >= 3 && !ghostWriterActive) {
          // Activate Ghost Writer for 5 minutes
          setGhostWriterActive(true);
          if (ghostWriterTimerRef.current) {
            clearTimeout(ghostWriterTimerRef.current);
          }
          ghostWriterTimerRef.current = setTimeout(() => {
            setGhostWriterActive(false);
            toast({
              title: "Ghost Writer Expired",
              description: "Your special message styling has ended.",
              variant: "default",
            });
          }, 5 * 60 * 1000); // 5 minutes
          
          toast({
            title: "👻 Ghost Writer Activated!",
            description: "Your messages will have special styling for 5 minutes!",
            variant: "default",
          });
        }
      } else {
        setDevilTypingCount(1);
        setLastDevilTypingTime(now);
      }
    }

    try {
      const { error } = await supabase.from('comments').insert({
        message_id: messageId,
        username: user.username,
        content: commentText.trim(),
        avatar_color: user.avatarColor,
      });

      if (!error) {
        setCommentInputs((prev) => ({ ...prev, [messageId]: '' }));
        if (!expandedComments.has(messageId)) {
          setExpandedComments((prev) => new Set(prev).add(messageId));
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (messageId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleReportClick = (messageId: string) => {
    setMessageToReport(messageId);
    setReportDialogOpen(true);
    setReportReason("");
  };

  const handleReportSubmit = async () => {
    if (!messageToReport || !sessionIdRef.current) return;

    try {
      const { error } = await supabase.from('reports').insert({
        message_id: messageToReport,
        session_id: sessionIdRef.current,
        reason: reportReason || 'No reason provided',
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already reported
          toast({
            title: "Already Reported",
            description: "You have already reported this message.",
            variant: "default",
          });
        } else {
          console.error('Error reporting message:', error);
          toast({
            title: "Error",
            description: "Failed to report message. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setReportedMessages((prev) => new Set(prev).add(messageToReport));
        toast({
          title: "Message Reported",
          description: "Thank you for reporting. Posts violating guidelines will be removed within 24 hours.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error reporting message:', error);
      toast({
        title: "Error",
        description: "Failed to report message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReportDialogOpen(false);
      setMessageToReport(null);
      setReportReason("");
    }
  };

  const handleAdminLogin = () => {
    if (adminId === 'rajaji' && adminPass === 'raniji') {
      setIsAdmin(true);
      setAdminLoginDialogOpen(false);
      setAdminId("");
      setAdminPass("");
      toast({
        title: "Admin Access Granted",
        description: "You now have admin privileges to delete posts.",
        variant: "default",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials.",
        variant: "destructive",
      });
      setAdminId("");
      setAdminPass("");
    }
  };


  const handleAvatarChange = async (avatarPath: string) => {
    if (!sessionIdRef.current || !user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_color: avatarPath })
        .eq('session_id', sessionIdRef.current);

      if (error) {
        console.error('Error updating avatar:', error);
        toast({
          title: "Error",
          description: "Failed to update avatar. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local user state
      setUser({
        ...user,
        avatarColor: avatarPath,
      });

      // Update all messages with this user's avatar
      setMessages((prev) =>
        prev.map((msg) =>
          msg.username === user.username
            ? { ...msg, avatarColor: avatarPath }
            : msg
        )
      );

      // Update all comments with this user's avatar
      setComments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((messageId) => {
          updated[messageId] = updated[messageId].map((comment) =>
            comment.username === user.username
              ? { ...comment, avatarColor: avatarPath }
              : comment
          );
        });
        return updated;
      });

      // Update trending messages with this user's avatar
      setTrendingMessages((prev) =>
        prev.map((msg) =>
          msg.username === user.username
            ? { ...msg, avatarColor: avatarPath }
            : msg
        )
      );

      setShowAvatarSelection(false);
      
      // Color Master Activation: Change avatar 3 times in 10 seconds
      const now = Date.now();
      const recentChanges = avatarChangeHistory.filter(time => now - time < 10000);
      const newHistory = [...recentChanges, now];
      setAvatarChangeHistory(newHistory);
      
      if (newHistory.length >= 3 && !colorMasterActive) {
        // Activate Color Master for 10 minutes
        setColorMasterActive(true);
        if (colorMasterTimerRef.current) {
          clearTimeout(colorMasterTimerRef.current);
        }
        colorMasterTimerRef.current = setTimeout(() => {
          setColorMasterActive(false);
          toast({
            title: "Color Master Expired",
            description: "Your rainbow username effect has ended.",
            variant: "default",
          });
        }, 10 * 60 * 1000); // 10 minutes
        
        toast({
          title: "🎨 Color Master Activated!",
          description: "Your username now has a rainbow effect for 10 minutes!",
          variant: "default",
        });
      }
      
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been changed successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToMessage = (messageId: string, messageCategory?: Category) => {
    // If message is in a different category, switch to that category first
    if (messageCategory && messageCategory !== activeCategory && messageCategory !== 'all') {
      setActiveCategory(messageCategory);
      // Wait a bit for the category to change and messages to filter
      setTimeout(() => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 2000);
        }
      }, 100);
    } else {
      // Message should be visible, scroll to it
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const filteredMessages = messages.filter((msg) => {
    // Handle messages without category - treat them as 'all'
    const messageCategory = msg.category || 'all';
    const matchesCategory = activeCategory === 'all' || messageCategory === activeCategory;
    const matchesSearch = !searchQuery ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Echo Chamber: Pin own messages to top when active
    if (echoChamberActive && user) {
      const aIsOwn = a.username === user.username;
      const bIsOwn = b.username === user.username;
      if (aIsOwn && !bIsOwn) return -1;
      if (!aIsOwn && bIsOwn) return 1;
    }
    // Default: newest first (timestamp descending)
    return b.timestamp - a.timestamp;
  });


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setCreatorDialogOpen(true)}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src="/favicon.jpg" 
                alt="Vhisper Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl object-cover"
              />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-base sm:text-lg leading-tight">
                <span className="text-white">V</span>
                <span className="text-red-500">hisper</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                DEVIL'S DEN
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0 max-w-xl">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input border border-border rounded-lg pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 sm:gap-2">
            {/* Super Powers Indicators */}
            {(colorMasterActive || echoChamberActive || ghostWriterActive) && (
              <div className="flex items-center gap-1 px-2 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                {colorMasterActive && (
                  <span className="text-yellow-400 text-xs" title="Color Master Active">🎨</span>
                )}
                {echoChamberActive && (
                  <span className="text-yellow-400 text-xs" title="Echo Chamber Active">🔊</span>
                )}
                {ghostWriterActive && (
                  <span className="text-yellow-400 text-xs" title="Ghost Writer Active">👻</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-accent/20 text-accent rounded-lg font-medium text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{onlineCount}+ online</span>
              <span className="sm:hidden">{onlineCount}+</span>
            </div>
            {user && (
              <button
                onClick={() => setProfileDialogOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium text-xs sm:text-sm hover:bg-secondary/80 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}
            <button
              onClick={() => setNewPostModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-xs sm:text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[57px] sm:top-[65px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                )}
              >
                <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Messages Feed */}
          <div className="flex-1 space-y-3 sm:space-y-4 pb-20 lg:pb-6">
            {isLoading ? (
              <ChatSkeleton count={5} />
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((message) => {
                const isOwnMessage = user && message.username === user.username;
                const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
                const messageComments = comments[message.id] || [];
                const isCommentsExpanded = expandedComments.has(message.id);
                const score = (message.likes || 0) - (message.dislikes || 0);

                return (
                  <article
                    id={`message-${message.id}`}
                    key={message.id}
                    className={cn(
                      "bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:border-primary/30",
                      isOwnMessage && "bg-primary/5 border-primary/20"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <img
                            src={message.avatarColor || '/d1.webp'}
                            alt={message.username}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // If avatar is not a valid image path, use default
                              if (!target.src.includes('/d') || target.src.includes('bg-')) {
                                target.src = '/d1.webp';
                              } else if (!target.src.includes('d1.webp')) {
                                target.src = '/d1.webp';
                              }
                            }}
                          />
                          <span 
                            className={cn(
                              "text-xs sm:text-sm font-medium truncate",
                              colorMasterActive && isOwnMessage 
                                ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse"
                                : "text-primary"
                            )}
                          >
                            {message.username}
                          </span>
                          {echoChamberActive && isOwnMessage && (
                            <span className="text-yellow-400" title="Echo Chamber Active">
                              📌
                            </span>
                          )}
                        </div>
                        {message.category && message.category !== 'all' && (
                          <span className={cn(
                            "px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 shrink-0",
                            message.category === 'news' && "bg-blue-500/20 text-blue-400",
                            message.category === 'campus-updates' && "bg-orange-500/20 text-orange-400",
                            message.category === 'academics' && "bg-emerald-500/20 text-emerald-400",
                            message.category === 'events' && "bg-pink-500/20 text-pink-400",
                            message.category === 'Confessions' && "bg-purple-500/20 text-purple-400",
                            message.category === 'clubs' && "bg-cyan-500/20 text-cyan-400",
                            message.category === 'placements' && "bg-amber-500/20 text-amber-400",
                          )}>
                            {(() => {
                              const category = categories.find(c => c.id === message.category);
                              const IconComponent = category?.icon;
                              return IconComponent ? <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : null;
                            })()}
                            <span className="hidden min-[375px]:inline">{categories.find(c => c.id === message.category)?.label}</span>
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:inline" />
                          <span className="hidden sm:inline">{timeAgo}</span>
                          <span className="sm:hidden">{format(new Date(message.timestamp), "HH:mm")}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                          {format(new Date(message.timestamp), "HH:mm")}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 sm:p-1.5 rounded-lg hover:bg-secondary transition-colors">
                              <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this post?')) {
                                    try {
                                      const { error } = await supabase
                                        .from('messages')
                                        .delete()
                                        .eq('id', message.id);
                                      
                                      if (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete post.",
                                          variant: "destructive",
                                        });
                                      } else {
                                        toast({
                                          title: "Post Deleted",
                                          description: "The post has been deleted successfully.",
                                          variant: "default",
                                        });
                                      }
                                    } catch (error) {
                                      console.error('Error deleting post:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete post.",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                }}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Post (Admin)
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleReportClick(message.id)}
                              disabled={reportedMessages.has(message.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              {reportedMessages.has(message.id) ? "Already Reported" : "Report Message"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "mb-3 sm:mb-4",
                      ghostWriterActive && isOwnMessage && "relative p-2 rounded-lg"
                    )}>
                      {ghostWriterActive && isOwnMessage && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 rounded-lg blur-md animate-pulse"></div>
                      )}
                      <p className={cn(
                        "text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap relative z-10",
                        ghostWriterActive && isOwnMessage
                          ? "text-foreground font-bold drop-shadow-lg"
                          : "text-foreground"
                      )}>
                        {message.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Voting */}
                        <div className="flex items-center gap-0.5 sm:gap-1 bg-secondary rounded-lg">
                        <button
                          onClick={() => handleVote(message.id, 'like')}
                          disabled={votingInProgress.has(message.id)}
                          className={cn(
                            "p-1.5 sm:p-2 rounded-l-lg transition-colors",
                            message.userVote === 'like'
                              ? "text-primary bg-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted",
                            votingInProgress.has(message.id) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                          <span
                            className={cn(
                              "text-xs sm:text-sm font-medium min-w-[1.75rem] sm:min-w-[2rem] text-center",
                              score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"
                            )}
                          >
                            {score > 0 ? `+${score}` : score}
                          </span>
                          <button
                            onClick={() => handleVote(message.id, 'dislike')}
                            disabled={votingInProgress.has(message.id)}
                            className={cn(
                              "p-1.5 sm:p-2 rounded-r-lg transition-colors",
                              message.userVote === 'dislike'
                                ? "text-destructive bg-destructive/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                              votingInProgress.has(message.id) && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Comments */}
                        <button
                          onClick={() => toggleComments(message.id)}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{message.commentCount || 0}</span>
                        </button>
                      </div>

                      {/* Share */}
                      <button 
                        onClick={async () => {
                          const messageUrl = `${window.location.origin}${window.location.pathname}?message=${message.id}`;
                          
                          // Try Web Share API first (mobile devices)
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: `Message by ${message.username}`,
                                text: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
                                url: messageUrl,
                              });
                              return;
                            } catch (error) {
                              // User cancelled or error occurred, fall through to clipboard
                            }
                          }

                          // Fallback to clipboard
                          try {
                            await navigator.clipboard.writeText(messageUrl);
                          } catch (error) {
                            // Silently fail
                          }
                        }}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {isCommentsExpanded && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border space-y-2 sm:space-y-3">
                        {/* Existing Comments */}
                        {messageComments.map((comment) => (
                          <div key={comment.id} className="flex gap-1.5 sm:gap-2 pl-1 sm:pl-2">
                            <img
                              src={comment.avatarColor || '/d1.webp'}
                              alt={comment.username}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('d1.webp')) {
                                  target.src = '/d1.webp';
                                }
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                <span className={cn(
                                  "text-[11px] sm:text-xs font-medium truncate",
                                  colorMasterActive && comment.username === user?.username
                                    ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse"
                                    : "text-primary"
                                )}>
                                  {comment.username}
                                </span>
                                {echoChamberActive && comment.username === user?.username && (
                                  <span className="text-yellow-400 text-[10px]" title="Echo Chamber Active">📌</span>
                                )}
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground shrink-0">
                                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                </span>
                              </div>
                              <div className={cn(
                                ghostWriterActive && comment.username === user?.username && "relative p-1 rounded"
                              )}>
                                {ghostWriterActive && comment.username === user?.username && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 rounded blur-sm animate-pulse"></div>
                                )}
                                <p className={cn(
                                  "text-xs sm:text-sm break-words relative z-10",
                                  ghostWriterActive && comment.username === user?.username
                                    ? "text-foreground font-bold drop-shadow-lg"
                                    : "text-foreground"
                                )}>
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex gap-1.5 sm:gap-2 pl-1 sm:pl-2">
                          {user ? (
                            <img
                              src={user.avatarColor || '/d1.webp'}
                              alt={user.username}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('/d1.webp')) {
                                  target.src = '/d1.webp';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shrink-0">
                              ?
                            </div>
                          )}
                          <div className="flex-1 flex gap-1.5 sm:gap-2">
                            <Input
                              value={commentInputs[message.id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [message.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(message.id);
                                }
                              }}
                              placeholder="Add a comment..."
                              className="flex-1 text-xs sm:text-sm h-7 sm:h-8"
                            />
                            <Button
                              onClick={() => handleComment(message.id)}
                              size="sm"
                              className="h-7 sm:h-8 px-2 sm:px-3"
                              disabled={!commentInputs[message.id]?.trim()}
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="bg-card border border-border rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                  {searchQuery ? "No messages found" : "No messages yet"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-[140px] space-y-4">
              {/* Trending Topics */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium">Trending Now</span>
                </div>
                <div className="space-y-3">
                  {trendingMessages.length > 0 ? (
                    trendingMessages.map((msg, index) => {
                      const category = categories.find(c => c.id === msg.category || 'all');
                      return (
                        <div
                          key={msg.id}
                          onClick={() => scrollToMessage(msg.id, msg.category)}
                          className="flex items-start gap-3 group cursor-pointer hover:bg-secondary/50 rounded-lg p-2 -m-2 transition-colors"
                        >
                          <span className="text-lg font-bold text-foreground w-5 shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <Flame className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 overflow-hidden text-ellipsis">
                                {msg.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {category && (
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-medium",
                                  msg.category === 'news' && "bg-blue-500/20 text-blue-400",
                                  msg.category === 'campus-updates' && "bg-orange-500/20 text-orange-400",
                                  msg.category === 'academics' && "bg-emerald-500/20 text-emerald-400",
                                  msg.category === 'events' && "bg-pink-500/20 text-pink-400",
                                  msg.category === 'Confessions' && "bg-purple-500/20 text-purple-400",
                                  msg.category === 'clubs' && "bg-cyan-500/20 text-cyan-400",
                                  msg.category === 'placements' && "bg-amber-500/20 text-amber-400",
                                )}>
                                  {category.label}
                                </span>
                              )}
                              <span className="text-[10px] text-red-500 font-medium">+{msg.likes}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No trending topics yet</p>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-700 dark:text-amber-500">Disclaimer</span>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  This platform is not associated with any institution. All posts are fictional or user-generated.
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <ScrollText className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Guidelines</span>
                </div>
                <ul className="space-y-2">
                  {guidelines.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <ShieldCheck className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* New Post Modal */}
      <NewPostModal
        isOpen={newPostModalOpen}
        onClose={() => setNewPostModalOpen(false)}
        onSubmit={handleNewPost}
      />

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Report Message
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for reporting this message. Posts that violate guidelines will be automatically removed within 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting (optional)"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Creator Dialog */}
      <Dialog 
        open={creatorDialogOpen} 
        onOpenChange={(open) => {
          setCreatorDialogOpen(open);
          if (!open) setShowEasterEgg(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-red-500 uppercase tracking-wider" style={{ fontFamily: 'monospace', letterSpacing: '0.2em', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 0, 0, 0.5)' }}>
              CREATOR
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-75 blur-xl animate-pulse"></div>
              <button
                onClick={() => {
                  setShowEasterEgg(true);
                  setTimeout(() => setShowEasterEgg(false), 3000);
                }}
                className="relative cursor-pointer group"
              >
                <img 
                  src="/satan-robot.gif" 
                  alt="Satan Robot" 
                  className="relative w-full max-w-xs h-auto rounded-2xl shadow-2xl transition-transform group-hover:scale-105"
                  style={{
                    boxShadow: '0 0 30px rgba(255, 69, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.6), 0 0 90px rgba(255, 140, 0, 0.4)'
                  }}
                />
              </button>
            </div>
            {showEasterEgg ? (
              <p className="text-center text-red-500 text-sm sm:text-base font-medium uppercase tracking-wider animate-pulse" style={{ fontFamily: 'monospace', letterSpacing: '0.15em', textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 69, 0, 0.5)' }}>
                the devil is in hell
              </p>
            ) : (
              <p className="text-center text-red-500 text-sm sm:text-base font-medium uppercase tracking-wider" style={{ fontFamily: 'monospace', letterSpacing: '0.15em', textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 69, 0, 0.5)' }}>
                made with hate by the devil
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {user && (() => {
        const avatarPath = user.avatarColor || getAvatarFromUsername(user.username);
        const avatarNumber = getAvatarNumberFromPath(avatarPath);
        const colorScheme = getAvatarColorScheme(avatarNumber);
        const textColor = avatarNumber === 1 ? 'text-red-400' :
                         avatarNumber === 2 ? 'text-gray-400' :
                         avatarNumber === 3 ? 'text-purple-400' :
                         avatarNumber === 4 ? 'text-green-400' :
                         avatarNumber === 5 ? 'text-white' :
                         avatarNumber === 6 ? 'text-red-400' :
                         avatarNumber === 7 ? 'text-gray-400' :
                         avatarNumber === 8 ? 'text-blue-400' :
                         avatarNumber === 9 ? 'text-purple-400' :
                         avatarNumber === 10 ? 'text-blue-400' :
                         avatarNumber === 11 ? 'text-red-400' :
                         'text-gray-400';
        
        // Determine if this is a legendary avatar and get its glow
        const isLegendary = avatarNumber >= 9 && avatarNumber <= 11;
        const legendaryGlow = avatarNumber === 9 ? 'from-purple-600 via-gray-400 to-purple-600' :
                              avatarNumber === 10 ? 'from-blue-600 via-blue-100 to-blue-600' :
                              avatarNumber === 11 ? 'from-red-600 via-green-500 to-red-600' :
                              null;
        
        return (
          <Dialog 
            open={profileDialogOpen} 
            onOpenChange={(open) => {
              setProfileDialogOpen(open);
              if (!open) {
                setShowAvatarSelection(false);
                setShowLegendaryAvatars(false);
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle 
                  className={`text-center text-xl font-bold ${textColor} uppercase tracking-wider cursor-pointer select-none`} 
                  style={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: '0.2em', 
                    textShadow: isLegendary 
                      ? (avatarNumber === 9 
                          ? '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(147, 51, 234, 0.7), 0 0 20px rgba(107, 114, 128, 0.5)'
                          : avatarNumber === 10
                          ? '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(37, 99, 235, 0.7), 0 0 20px rgba(219, 234, 254, 0.5)'
                          : '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(220, 38, 38, 0.7), 0 0 20px rgba(34, 197, 94, 0.5)')
                      : colorScheme.textShadow 
                  }}
                  onDoubleClick={() => {
                    setShowLegendaryAvatars(!showLegendaryAvatars);
                  }}
                >
                  PROFILE
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  {isLegendary && legendaryGlow ? (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${legendaryGlow} opacity-80 blur-xl animate-pulse`}></div>
                  ) : (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorScheme.glow.from} ${colorScheme.glow.via} ${colorScheme.glow.to} opacity-75 blur-xl animate-pulse`}></div>
                  )}
                  <button
                    onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={avatarPath}
                      alt={`${user.username} Avatar`}
                      className="relative w-full max-w-xs h-auto rounded-2xl shadow-2xl object-cover transition-all group-hover:opacity-80 group-hover:scale-105 z-10"
                      style={{
                        boxShadow: isLegendary 
                          ? (avatarNumber === 9 
                              ? '0 0 30px rgba(147, 51, 234, 0.8), 0 0 60px rgba(107, 114, 128, 0.6), 0 0 90px rgba(147, 51, 234, 0.4)'
                              : avatarNumber === 10
                              ? '0 0 30px rgba(37, 99, 235, 0.8), 0 0 60px rgba(219, 234, 254, 0.6), 0 0 90px rgba(37, 99, 235, 0.4)'
                              : '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(34, 197, 94, 0.6), 0 0 90px rgba(220, 38, 38, 0.4)')
                          : colorScheme.boxShadow
                      }}
                      onError={(e) => {
                        // Fallback to d1 if image fails to load
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('d1.webp')) {
                          target.src = '/d1.webp';
                        }
                      }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Change Avatar</span>
                    </div>
                  </button>
                </div>
                
                {/* Avatar Selection UI */}
                {showAvatarSelection && (
                  <div className="w-full mt-2 p-4 bg-secondary/50 rounded-xl border border-border">
                    <p className="text-sm font-medium mb-3 text-center">Choose Your Avatar</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const extension = num === 7 ? 'jpg' : 'webp';
                        const avatarPathOption = `/d${num}.${extension}`;
                        const isSelected = user.avatarColor === avatarPathOption;
                        const avatarNum = getAvatarNumberFromPath(avatarPathOption);
                        const scheme = getAvatarColorScheme(avatarNum);
                        
                        return (
                          <button
                            key={num}
                            onClick={() => handleAvatarChange(avatarPathOption)}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-110",
                              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${scheme.glow.from} ${scheme.glow.via} ${scheme.glow.to} opacity-50 blur-sm`}></div>
                            <img
                              src={avatarPathOption}
                              alt={`Avatar ${num}`}
                              className="relative w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/d1.webp';
                              }}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowAvatarSelection(false)}
                      className="w-full mt-3 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Legendary Avatars Section - Only shown when PROFILE text is double-clicked */}
                {showLegendaryAvatars && (
                  <div className="w-full mt-2 p-4 bg-secondary/50 rounded-xl border border-border">
                    <p className="text-sm font-medium mb-3 text-center text-yellow-400">Legendary Avatars</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { num: 9, ext: 'jpg', gradient: 'from-purple-600 via-gray-400 to-purple-600' },
                        { num: 10, ext: 'png', gradient: 'from-blue-600 via-blue-100 to-blue-600' },
                        { num: 11, ext: 'jpg', gradient: 'from-red-600 via-green-500 to-red-600' }
                      ].map(({ num, ext, gradient }) => {
                        const avatarPathOption = `/d${num}.${ext}`;
                        const isSelected = user.avatarColor === avatarPathOption;
                        
                        // Get ring color based on avatar number
                        const ringColor = num === 9 ? 'ring-purple-400' : 
                                        num === 10 ? 'ring-blue-400' : 
                                        'ring-red-400';
                        
                        return (
                          <button
                            key={num}
                            onClick={() => handleAvatarChange(avatarPathOption)}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-visible transition-all hover:scale-110",
                              isSelected && `ring-2 ${ringColor} ring-offset-2 ring-offset-background`
                            )}
                          >
                            <div className={`absolute -inset-2 bg-gradient-to-r ${gradient} opacity-80 blur-lg animate-pulse rounded-lg`}></div>
                            <div className="relative rounded-lg overflow-hidden z-10">
                              <img
                                src={avatarPathOption}
                                alt={`Legendary Avatar ${num}`}
                                className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/d1.webp';
                              }}
                              />
                              {isSelected && (
                                <div className={cn(
                                  "absolute inset-0 flex items-center justify-center",
                                  num === 9 && "bg-purple-400/20",
                                  num === 10 && "bg-blue-400/20",
                                  num === 11 && "bg-red-400/20"
                                )}>
                                  <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center",
                                    num === 9 && "bg-purple-400",
                                    num === 10 && "bg-blue-400",
                                    num === 11 && "bg-red-400"
                                  )}>
                                    <span className={cn(
                                      "text-xs font-bold",
                                      num === 9 && "text-purple-900",
                                      num === 10 && "text-blue-900",
                                      num === 11 && "text-red-900"
                                    )}>✓</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowLegendaryAvatars(false)}
                      className="w-full mt-3 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
                <div className="text-center">
                  <p className={`${textColor} text-sm sm:text-base font-medium uppercase tracking-wider mb-2`} style={{ fontFamily: 'monospace', letterSpacing: '0.15em', textShadow: colorScheme.textShadow }}>
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Messages are automatically deleted after 1{' '}
                    <button
                      onClick={() => {
                        const newCount = weekClickCount + 1;
                        setWeekClickCount(newCount);
                        if (newCount >= 4) {
                          setAdminLoginDialogOpen(true);
                          setWeekClickCount(0); // Reset counter
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                    >
                      week
                    </button>
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Admin Login Dialog */}
      <Dialog open={adminLoginDialogOpen} onOpenChange={setAdminLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Admin ID</label>
              <Input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter admin ID"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const adminPassInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                    adminPassInput?.focus();
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAdminLogin}
                className="flex-1"
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAdminLoginDialogOpen(false);
                  setAdminId("");
                  setAdminPass("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
