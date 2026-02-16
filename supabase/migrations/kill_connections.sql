-- Attempt to kill all other connections to the database to clear locks
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() 
  AND pid <> pg_backend_pid() 
  AND state in ('idle', 'idle in transaction', 'active');
