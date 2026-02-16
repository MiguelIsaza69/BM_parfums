-- EMERGENCY SCRIPT TO KILL STUCK TRANSACTIONS
-- Run this in Supabase SQL Editor to unfreeze the database

SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() 
  AND pid <> pg_backend_pid() 
  AND (state = 'idle in transaction' OR state = 'active');
