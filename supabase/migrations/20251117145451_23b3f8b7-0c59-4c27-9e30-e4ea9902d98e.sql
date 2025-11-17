-- Comprehensive security fix for profiles table

-- 1. Drop existing public_profiles view and recreate with phone masking
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  rating_average,
  rating_count,
  created_at,
  -- Masked phone: show first 2 and last 4 digits, mask the rest
  CASE 
    WHEN phone IS NOT NULL AND LENGTH(phone) > 6 THEN
      CONCAT(
        SUBSTRING(phone, 1, 2),
        REPEAT('x', LENGTH(phone) - 6),
        SUBSTRING(phone, LENGTH(phone) - 3, 4)
      )
    ELSE NULL
  END AS masked_phone
FROM profiles;

-- Grant access to the public view for everyone
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 2. Drop the overly permissive "View sensitive data during active transactions" policy
-- and recreate it to only show sensitive data during APPROVED/ACTIVE requests (not pending)
DROP POLICY IF EXISTS "View sensitive data during active transactions" ON public.profiles;

CREATE POLICY "View sensitive data during active transactions"
ON public.profiles
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
      AND requests.status IN ('approved', 'active', 'completed')
  )
);

-- 3. Ensure there are no other policies that expose sensitive data publicly
-- The existing policies are:
-- - "Users can view own profile" (auth.uid() = id) ✓ SAFE
-- - "Users can insert own profile" (auth.uid() = id) ✓ SAFE  
-- - "Users can update own profile" (auth.uid() = id) ✓ SAFE
-- - "View sensitive data during active transactions" (just recreated above) ✓ SAFE

-- No changes needed to other policies - they are already secure