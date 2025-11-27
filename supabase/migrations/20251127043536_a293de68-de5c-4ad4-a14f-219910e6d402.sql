-- Add contact scheduling fields to requests table
ALTER TABLE public.requests
ADD COLUMN contact_date DATE,
ADD COLUMN contact_time TIME;