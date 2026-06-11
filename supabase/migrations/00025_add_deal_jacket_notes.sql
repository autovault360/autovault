-- Add notes column to deal_jackets table

alter table deal_jackets
add column if not exists notes text;

-- Update customer state column when state is provided
-- (this is handled application-side in server actions)
