-- Add review status column to deal_jackets

alter table deal_jackets
  add column if not exists status text
    not null
    default 'pending_review'
    check (status in ('pending_review', 'accepted', 'rejected'));

create index if not exists idx_deal_jackets_status
  on deal_jackets (status)
  where deleted_at is null;
