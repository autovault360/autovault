# CPA Portal � Development Seed

## 1. Apply migration

Run `00017_cpa_portal.sql` against your Supabase project (CLI `supabase db push` or SQL editor).

## 2. Create Supabase Auth user

In Supabase Dashboard ? Authentication ? Users ? Add user:

- **Email:** `cpa@autovault360.com`
- **Password:** `CPAAutoVault360`
- Confirm email (disable confirmation in dev if needed)

## 3. Link `users` row

After auth user exists, insert or update in `users`:

```sql
insert into users (auth_user_id, dealership_id, email, full_name, role, is_active)
select
  au.id,
  (select id from dealerships where status = 'active' order by created_at asc limit 1),
  'cpa@autovault360.com',
  'Wilson & Associates CPA',
  'cpa',
  true
from auth.users au
where au.email = 'cpa@autovault360.com'
on conflict (auth_user_id) do update set
  role = 'cpa',
  is_active = true,
  full_name = excluded.full_name;
```

## 4. CPA profile

```sql
insert into cpa_profiles (user_id, first_name, last_name, status)
select id, 'Wilson', 'Associates', 'ACTIVE'
from users where email = 'cpa@autovault360.com'
on conflict (user_id) do update set status = 'ACTIVE';
```

## 5. Login

Open `/cpa/login` and sign in with the credentials above.

Sample notes are seeded automatically by the migration when a dealership and user exist.
