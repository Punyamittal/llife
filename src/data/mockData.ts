import { User, Message } from "@/types/chat";

export const mockUsers: User[] = [
  { id: "1", username: "SilentLion7059", avatar: "🦁", isOnline: true },
  { id: "2", username: "GhostWolf91", avatar: "🐺", isOnline: true },
  { id: "3", username: "MysticOwl42", avatar: "🦉", isOnline: true },
  { id: "4", username: "ShadowFox88", avatar: "🦊", isOnline: false },
  { id: "5", username: "NeonTiger23", avatar: "🐯", isOnline: true },
  { id: "6", username: "CrypticBear55", avatar: "🐻", isOnline: true },
  { id: "7", username: "PhantomEagle12", avatar: "🦅", isOnline: false },
  { id: "8", username: "CosmicPanda77", avatar: "🐼", isOnline: true },
  { id: "9", username: "StealthRaven33", avatar: "🐦‍⬛", isOnline: true },
  { id: "10", username: "VoidDragon99", avatar: "🐉", isOnline: true },
];

export const currentUserId = "1";

const now = new Date();

export const mockMessages: Message[] = [
  {
    id: "1",
    content: "anyone else stressed about finals? 😩",
    userId: "2",
    timestamp: new Date(now.getTime() - 1800000),
    reactions: [{ emoji: "😂", count: 3, userIds: ["1", "5", "8"] }],
  },
  {
    id: "2",
    content: "Literally haven't slept in 2 days lmao",
    userId: "3",
    timestamp: new Date(now.getTime() - 1750000),
    reactions: [],
  },
  {
    id: "3",
    content: "The library is packed rn, had to sit on the floor 💀",
    userId: "5",
    timestamp: new Date(now.getTime() - 1700000),
    reactions: [{ emoji: "❤️", count: 2, userIds: ["2", "3"] }],
  },
  {
    id: "4",
    content: "same!! we need more study spots on campus",
    userId: "1",
    timestamp: new Date(now.getTime() - 1650000),
    reactions: [{ emoji: "👍", count: 4, userIds: ["2", "3", "5", "8"] }],
  },
  {
    id: "5",
    content: "Did anyone understand the calc homework? Question 5 is killing me",
    userId: "8",
    timestamp: new Date(now.getTime() - 1200000),
    reactions: [],
  },
  {
    id: "6",
    content: "which professor?",
    userId: "6",
    timestamp: new Date(now.getTime() - 1150000),
    reactions: [],
  },
  {
    id: "7",
    content: "Dr. Chen - the integration by parts one",
    userId: "8",
    timestamp: new Date(now.getTime() - 1100000),
    reactions: [],
  },
  {
    id: "8",
    content: "Oh that one! Use u-sub first then IBP",
    userId: "1",
    timestamp: new Date(now.getTime() - 1050000),
    reactions: [{ emoji: "🎉", count: 1, userIds: ["8"] }],
  },
  {
    id: "9",
    content: "you're a lifesaver fr 🙏",
    userId: "8",
    timestamp: new Date(now.getTime() - 1000000),
    reactions: [{ emoji: "❤️", count: 1, userIds: ["1"] }],
  },
  {
    id: "10",
    content: "Anyone going to the basketball game tonight?",
    userId: "9",
    timestamp: new Date(now.getTime() - 600000),
    reactions: [{ emoji: "🎉", count: 2, userIds: ["5", "10"] }],
  },
  {
    id: "11",
    content: "Yess!! We're playing State, should be a good game",
    userId: "10",
    timestamp: new Date(now.getTime() - 550000),
    reactions: [],
  },
  {
    id: "12",
    content: "might swing by after this study session",
    userId: "1",
    timestamp: new Date(now.getTime() - 500000),
    reactions: [{ emoji: "👍", count: 2, userIds: ["9", "10"] }],
  },
  {
    id: "13",
    content: "The dining hall has that new ramen station btw, actually fire 🔥",
    userId: "5",
    timestamp: new Date(now.getTime() - 300000),
    reactions: [
      { emoji: "❤️", count: 3, userIds: ["1", "3", "8"] },
      { emoji: "🎉", count: 1, userIds: ["6"] },
    ],
  },
  {
    id: "14",
    content: "wait where?? I need to try that",
    userId: "3",
    timestamp: new Date(now.getTime() - 250000),
    reactions: [],
  },
  {
    id: "15",
    content: "Main hall, by the salad bar. They added it yesterday",
    userId: "5",
    timestamp: new Date(now.getTime() - 200000),
    reactions: [{ emoji: "👍", count: 1, userIds: ["3"] }],
  },
];

export const simulatedMessages = [
  { content: "just got out of my chem lab, that was brutal 😭", userId: "6" },
  { content: "anyone want to grab coffee at the student center?", userId: "9" },
  { content: "the wifi in the dorms is so bad today", userId: "10" },
  { content: "did they fix the printer in the library yet?", userId: "3" },
];
