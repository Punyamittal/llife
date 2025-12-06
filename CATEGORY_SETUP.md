# Category Setup Guide

## Step 1: Update Database Schema

Run this SQL in your Supabase SQL Editor to add category support to messages:

```sql
-- Add category column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'all' CHECK (category IN ('all', 'news', 'campus-updates', 'academics', 'events', 'Confessions', 'clubs', 'placements'));

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Update existing messages to have 'all' category if they don't have one
UPDATE messages SET category = 'all' WHERE category IS NULL;
```

Or simply run the file: `supabase/add-category-to-messages.sql`

## Step 2: Verify

After running the SQL, your messages table will have a `category` column. All new messages will be tagged with the selected category.

## Features Added

✅ **Category Tabs** - Filter messages by category (All Posts, News, Campus Updates, etc.)
✅ **Category Badges** - Each message shows its category with a colored badge
✅ **Category Selection** - Messages are automatically tagged with the active category when sent
✅ **Real-time Filtering** - Messages filter instantly when switching categories

## Available Categories

- 🔥 **All Posts** - Shows all messages
- 📰 **News** - Campus news and announcements
- 🏛️ **Campus Updates** - Updates about campus facilities, services
- 📚 **Academics** - Academic discussions, classes, professors
- 🎉 **Events** - Campus events, festivals, activities
- 💬 **Confessions** - Anonymous Confessions
- 🎯 **Clubs** - Club activities, announcements
- 💼 **Placements** - Job opportunities, placement news

## How It Works

1. Select a category tab at the top
2. Type and send a message - it will be tagged with that category
3. Messages are filtered to show only the selected category
4. Each message displays its category badge
5. Switch categories to see different conversations

That's it! Your chat now has organized sections! 🎉

