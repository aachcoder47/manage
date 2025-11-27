# Environment Variables for Razorpay Integration

Add the following environment variables to your `.env` file:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Razorpay Webhook Secret (for webhook signature verification)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay Plan IDs (create these in Razorpay Dashboard)
RAZORPAY_PLAN_BASIC=plan_xxxxxxxxxxxxx
RAZORPAY_PLAN_PRO=plan_xxxxxxxxxxxxx
RAZORPAY_PLAN_ADVANCED=plan_xxxxxxxxxxxxx
```

## Setup Instructions

### 1. Create Razorpay Account
1. Sign up at https://razorpay.com/
2. Complete KYC verification
3. Enable International Payments in Dashboard → Settings → Payment Methods

### 2. Get API Keys
1. Go to Dashboard → Settings → API Keys
2. Generate Test/Live keys
3. Copy Key ID and Key Secret to `.env`

### 3. Create Subscription Plans
1. Go to Dashboard → Subscriptions → Plans
2. Create three plans:
   - **Basic**: ₹3,999/month (or $49 equivalent)
   - **Pro**: ₹16,199/month (or $199 equivalent)
   - **Advanced**: ₹40,599/month (or $499 equivalent)
3. Copy Plan IDs to `.env`

### 4. Setup Webhook
1. Go to Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.paused`
   - `subscription.halted`
4. Copy Webhook Secret to `.env`

### 5. Run Database Migration
```bash
# Apply the subscription table migration
supabase migration up
# Or run the SQL manually in Supabase SQL Editor
```

### 6. Test Payment Flow
1. Use Razorpay test mode
2. Test card: 4111 1111 1111 1111
3. Any future expiry date
4. Any CVV

## Important Notes
- Always test in Razorpay Test Mode before going live
- Webhook URL must be publicly accessible (use ngrok for local testing)
- Keep API keys secure and never commit to version control
