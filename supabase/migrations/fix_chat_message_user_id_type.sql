-- Fix chat_message user_id columns to accept Clerk user IDs (TEXT) instead of UUID
alter table if exists public.chat_message
alter column sender_id type text using sender_id::text;

alter table if exists public.chat_message
alter column receiver_id type text using receiver_id::text;

-- Update RLS policies to compare with auth.uid() as string
drop policy if exists "Users can view their own messages" on public.chat_message;
drop policy if exists "Users can send messages" on public.chat_message;

create policy "Users can view their own messages" on public.chat_message
for select using (
    auth.uid()::text = sender_id or auth.uid()::text = receiver_id
);

create policy "Users can send messages" on public.chat_message
for insert with check (
    auth.uid()::text = sender_id
);
