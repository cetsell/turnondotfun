-- Enable Row Level Security on the marketplace table
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anonymous read access to all marketplace items
CREATE POLICY "Allow anonymous read access" 
ON public.marketplace
FOR SELECT 
USING (true);

-- Create a policy to allow authenticated users to insert marketplace items
-- Note: If there's no user_id column, we're allowing any authenticated user to insert
CREATE POLICY "Allow authenticated users to insert items" 
ON public.marketplace
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create a policy to allow authenticated users to update marketplace items
-- Note: If there's no user_id column, we're allowing any authenticated user to update
-- You may want to restrict this based on your business logic
CREATE POLICY "Allow authenticated users to update items" 
ON public.marketplace
FOR UPDATE 
TO authenticated
USING (true);

-- Create a policy to allow authenticated users to delete marketplace items
-- Note: If there's no user_id column, we're allowing any authenticated user to delete
-- You may want to restrict this based on your business logic
CREATE POLICY "Allow authenticated users to delete items" 
ON public.marketplace
FOR DELETE 
TO authenticated
USING (true);

-- If you have an assets table that's referenced by marketplace (via asset_id)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read assets
CREATE POLICY "Allow anonymous read access" 
ON public.assets
FOR SELECT 
USING (true);

-- If you have a stories table that's referenced by marketplace (via story_id)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stories
CREATE POLICY "Allow anonymous read access" 
ON public.stories
FOR SELECT 
USING (true);

-- Note: These policies assume that:
-- 1. The marketplace table doesn't have a user_id column for ownership
-- 2. You want to allow any authenticated user to modify marketplace items
-- 3. You want to allow anonymous users to read all marketplace items
--
-- If you need more restrictive policies, you'll need to modify these based on your specific requirements. 