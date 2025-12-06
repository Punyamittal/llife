-- Add category column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'all' CHECK (category IN ('all', 'news', 'campus-updates', 'academics', 'events', 'Confessions', 'clubs', 'placements'));

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Update existing messages to have 'all' category if they don't have one
UPDATE messages SET category = 'all' WHERE category IS NULL;

