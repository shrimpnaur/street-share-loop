-- Fix security vulnerability: Restrict access to sensitive profile data

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Policy 1: Users can view their own complete profile (including sensitive data)
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can view basic info of other profiles (excluding sensitive fields)
-- Note: Since RLS doesn't support column-level restrictions, we create a view instead
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  rating_average,
  rating_count,
  credits,
  created_at
FROM profiles;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Policy 3: Users can view sensitive data of others during active transactions
CREATE POLICY "View sensitive data during active transactions"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM requests
    WHERE 
      (
        (requests.requester_id = auth.uid() AND requests.owner_id = profiles.id)
        OR 
        (requests.owner_id = auth.uid() AND requests.requester_id = profiles.id)
      )
      AND requests.status IN ('pending', 'approved', 'active', 'completed')
  )
);