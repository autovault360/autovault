-- Backfill vehicles that already have an open deal jacket (runs after enum value exists).
update vehicles v
set status = 'pending_deal'
from deal_jackets dj
where dj.vehicle_id = v.id
  and dj.deleted_at is null
  and dj.workflow_status not in ('approved', 'rejected')
  and v.status in ('in_stock', 'needs_attention');
