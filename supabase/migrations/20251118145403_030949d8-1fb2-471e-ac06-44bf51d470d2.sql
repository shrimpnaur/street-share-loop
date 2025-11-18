-- Fix: User Identity Exposed in Public Listings
-- Create a public view that excludes user_id to prevent privacy violations

-- 1. Create public_listings view without sensitive user_id
CREATE OR REPLACE VIEW public.public_listings 
WITH (security_invoker = true)
AS
SELECT 
  id,
  created_at,
  updated_at,
  title,
  description,
  category,
  listing_type,
  images,
  price_per_day,
  deposit_amount,
  credit_cost,
  available_from,
  available_until,
  latitude,
  longitude,
  status
FROM listings
WHERE status <> 'deleted';

-- Grant access to the public view
GRANT SELECT ON public.public_listings TO authenticated, anon;

-- 2. Update listings table RLS policy to restrict direct access
-- Drop the existing public policy
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;

-- Create new restrictive policies for listings table
-- Authenticated users can view all listings (for request creation)
CREATE POLICY "Authenticated users can view listings"
ON public.listings
FOR SELECT
TO authenticated
USING (status <> 'deleted');

-- Users can view their own listings
CREATE POLICY "Users can view own listings"
ON public.listings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);