-- Check if the marketplace table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'marketplace'
);

-- Get the column information for the marketplace table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'marketplace'
ORDER BY ordinal_position;

-- Check if the assets table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'assets'
);

-- Get the column information for the assets table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'assets'
ORDER BY ordinal_position;

-- Check if the stories table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'stories'
);

-- Get the column information for the stories table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'stories'
ORDER BY ordinal_position;

-- Check if RLS is enabled on the marketplace table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'marketplace';

-- Check existing RLS policies on the marketplace table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'marketplace';

-- Count the number of rows in the marketplace table
SELECT COUNT(*) FROM marketplace;

-- Get a sample of data from the marketplace table
SELECT * FROM marketplace LIMIT 5; 