-- Migration: Add form fields to deal_jackets table
-- Supports warranty, gap, lender, ROS#, deal type, trade-in, notes

ALTER TABLE deal_jackets
  ADD COLUMN IF NOT EXISTS trade_in_allowance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gap_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lender text,
  ADD COLUMN IF NOT EXISTS ros_number text,
  ADD COLUMN IF NOT EXISTS deal_type text NOT NULL DEFAULT 'Retail'
    CHECK (deal_type IN ('Retail', 'Wholesale', 'Fleet'));
