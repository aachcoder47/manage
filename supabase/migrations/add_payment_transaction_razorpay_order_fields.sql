alter table if exists public.payment_transaction
add column if not exists razorpay_order_id text;

alter table if exists public.payment_transaction
add column if not exists razorpay_signature text;

create index if not exists idx_payment_transaction_razorpay_order_id
on public.payment_transaction(razorpay_order_id);
