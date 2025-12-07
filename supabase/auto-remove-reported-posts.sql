-- Function to automatically remove reported posts after 24 hours
-- This function should be scheduled to run periodically (e.g., every hour)

CREATE OR REPLACE FUNCTION remove_reported_posts_after_24h()
RETURNS void AS $$
BEGIN
  -- Delete messages that have been reported and are older than 24 hours
  -- The CASCADE will automatically delete associated comments and votes
  DELETE FROM messages
  WHERE id IN (
    SELECT DISTINCT r.message_id
    FROM reports r
    WHERE r.reported_at < NOW() - INTERVAL '24 hours'
  );
  
  -- Also clean up the reports themselves after deletion
  DELETE FROM reports
  WHERE reported_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function that can be called manually or via cron
-- To use this with Supabase, you can:
-- 1. Set up a pg_cron job (if available in your Supabase plan)
-- 2. Use Supabase Edge Functions with a scheduled trigger
-- 3. Use an external cron service to call this function via API

-- Example pg_cron schedule (if pg_cron extension is enabled):
-- SELECT cron.schedule(
--   'remove-reported-posts',
--   '0 * * * *', -- Run every hour
--   'SELECT remove_reported_posts_after_24h();'
-- );

