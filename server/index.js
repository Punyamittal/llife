import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, 'chat.db'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
`);

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
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get or create user
function getOrCreateUser(socketId) {
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(socketId);
  
  if (!user) {
    const username = generateUsername();
    const avatarColor = generateAvatarColor();
    const now = Date.now();
    
    db.prepare(`
      INSERT INTO users (id, username, avatar_color, created_at, last_seen)
      VALUES (?, ?, ?, ?, ?)
    `).run(socketId, username, avatarColor, now, now);
    
    user = { id: socketId, username, avatar_color: avatarColor, created_at: now, last_seen: now };
  } else {
    // Update last_seen
    db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(Date.now(), socketId);
  }
  
  return user;
}

// Get recent messages (last 50)
function getRecentMessages() {
  const messages = db.prepare(`
    SELECT id, username, content, avatar_color, created_at as timestamp
    FROM messages
    ORDER BY created_at DESC
    LIMIT 50
  `).all();
  
  return messages.reverse().map(msg => ({
    id: msg.id.toString(),
    username: msg.username,
    content: msg.content,
    avatarColor: msg.avatar_color,
    timestamp: msg.timestamp
  }));
}

// Track online users
let onlineUsers = new Set();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Get or create user
  const user = getOrCreateUser(socket.id);
  onlineUsers.add(socket.id);
  
  // Send user info to client
  socket.emit('user-assigned', {
    username: user.username,
    avatarColor: user.avatar_color
  });
  
  // Send recent messages
  const recentMessages = getRecentMessages();
  socket.emit('messages', recentMessages);
  
  // Send current online count
  io.emit('online-count', onlineUsers.size);
  
  // Broadcast user joined
  io.emit('user-joined', {
    username: user.username,
    timestamp: Date.now()
  });
  
  // Handle new message
  socket.on('message', (data) => {
    const { content } = data;
    
    if (!content || content.trim().length === 0) {
      return;
    }
    
    const now = Date.now();
    
    // Save message to database
    const result = db.prepare(`
      INSERT INTO messages (username, content, avatar_color, created_at)
      VALUES (?, ?, ?, ?)
    `).run(user.username, content.trim(), user.avatar_color, now);
    
    // Broadcast message to all clients
    const message = {
      id: result.lastInsertRowid.toString(),
      username: user.username,
      content: content.trim(),
      avatarColor: user.avatar_color,
      timestamp: now
    };
    
    io.emit('new-message', message);
  });
  
  // Handle typing indicator
  socket.on('typing', () => {
    socket.broadcast.emit('user-typing', {
      username: user.username
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers.delete(socket.id);
    io.emit('online-count', onlineUsers.size);
    io.emit('user-left', {
      username: user.username,
      timestamp: Date.now()
    });
  });
});

// Cleanup old messages (older than 1 week)
function cleanupOldMessages() {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const result = db.prepare('DELETE FROM messages WHERE created_at < ?').run(oneWeekAgo);
  console.log(`Cleaned up ${result.changes} old messages`);
  
  // Also cleanup inactive users (not seen in 1 week)
  const userResult = db.prepare('DELETE FROM users WHERE last_seen < ?').run(oneWeekAgo);
  console.log(`Cleaned up ${userResult.changes} inactive users`);
}

// Run cleanup every hour
setInterval(cleanupOldMessages, 60 * 60 * 1000);

// Run cleanup on startup
cleanupOldMessages();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

