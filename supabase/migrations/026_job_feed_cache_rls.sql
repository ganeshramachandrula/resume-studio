-- Enable RLS on job_feed_cache to prevent public access via PostgREST.
-- No policies added: table is accessed only via service role.
ALTER TABLE job_feed_cache ENABLE ROW LEVEL SECURITY;
