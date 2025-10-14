-- Strengthen organization invite codes from 8 to 16 characters
-- This increases entropy from 32 bits to 64 bits, making brute force attacks impractical

ALTER TABLE organizations 
ALTER COLUMN invite_code SET DEFAULT 
  SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 16);