-- Create push_subscriptions table
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true not null,
  
  -- Ensure one subscription per user (we can extend this later for multiple devices)
  unique(user_id)
);

-- Add RLS policies
alter table push_subscriptions enable row level security;

-- Users can only see their own subscriptions
create policy "Users can view own subscriptions" on push_subscriptions
  for select using (auth.uid() = user_id);

-- Users can insert their own subscriptions
create policy "Users can insert own subscriptions" on push_subscriptions
  for insert with check (auth.uid() = user_id);

-- Users can update their own subscriptions
create policy "Users can update own subscriptions" on push_subscriptions
  for update using (auth.uid() = user_id);

-- Users can delete their own subscriptions
create policy "Users can delete own subscriptions" on push_subscriptions
  for delete using (auth.uid() = user_id);

-- Add updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_push_subscriptions_updated_at
  before update on push_subscriptions
  for each row
  execute procedure update_updated_at_column();

-- Add index for faster lookups
create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);
create index if not exists idx_push_subscriptions_is_active on push_subscriptions(is_active); 