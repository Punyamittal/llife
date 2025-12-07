# Auto-Remove Reported Posts Setup

This feature automatically removes posts that have been reported and violate guidelines within 24 hours.

## Setup Instructions

### Step 1: Create the Function

Run the SQL file in your Supabase SQL Editor:

```sql
-- File: supabase/auto-remove-reported-posts.sql
```

Or copy and paste the function directly:

```sql
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
```

### Step 2: Schedule the Function

You have several options to run this function automatically:

#### Option A: Supabase pg_cron (Recommended if available)

If your Supabase plan supports pg_cron extension:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'remove-reported-posts',
  '0 * * * *', -- Run every hour at minute 0
  'SELECT remove_reported_posts_after_24h();'
);
```

#### Option B: Supabase Edge Functions + Cron

1. Create a Supabase Edge Function that calls this SQL function
2. Set up a scheduled trigger (cron job) to call the Edge Function

#### Option C: External Cron Service

Use an external service like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions** (with scheduled workflows)

Set up a webhook/API call to trigger the function via Supabase REST API or Edge Function.

#### Option D: Manual Execution

You can manually run the function anytime:

```sql
SELECT remove_reported_posts_after_24h();
```

## How It Works

1. **User reports a post** → Report is saved to `reports` table with timestamp
2. **Function runs periodically** → Checks for reports older than 24 hours
3. **Automatic deletion** → Messages with reports older than 24 hours are deleted
4. **Cascade cleanup** → Associated comments, votes, and reports are also deleted

## Important Notes

- ⚠️ **This is automatic and permanent** - Once a post is deleted, it cannot be recovered
- ⚠️ **All reported posts are removed** - The function doesn't distinguish between valid/invalid reports
- ⚠️ **24-hour window** - Posts are removed exactly 24 hours after being reported, not after review
- ✅ **Cascade deletion** - Comments and votes on deleted posts are automatically removed
- ✅ **Report cleanup** - Old reports are also cleaned up automatically

## Monitoring

To check how many posts would be removed (without actually deleting):

```sql
SELECT COUNT(DISTINCT r.message_id) as posts_to_remove
FROM reports r
WHERE r.reported_at < NOW() - INTERVAL '24 hours';
```

## Testing

To test the function manually:

1. Create a test message
2. Report it
3. Manually update the report timestamp to be older than 24 hours:
   ```sql
   UPDATE reports 
   SET reported_at = NOW() - INTERVAL '25 hours' 
   WHERE message_id = 'your-test-message-id';
   ```
4. Run the function:
   ```sql
   SELECT remove_reported_posts_after_24h();
   ```
5. Verify the message is deleted

## That's it! 🎉

Your auto-removal system is now set up. Reported posts will be automatically removed within 24 hours.

