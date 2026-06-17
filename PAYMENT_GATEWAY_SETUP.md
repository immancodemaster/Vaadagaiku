# Payment Gateway Setup - Quick Reference

## Quick Start (Cashfree)

### 1. Get Sandbox Credentials

**Cashfree Dashboard:**
1. Sign up at https://dashboard.cashfree.com/
2. Settings → API Keys → Copy **Sandbox** keys

### 2. Update .env.local

```bash
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
NEXT_PUBLIC_CASHFREE_APP_ID=<your_app_id>
CASHFREE_KEY_SECRET=<your_key_secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Test Locally

```bash
npm run dev
# Go to http://localhost:3000
# Login → Browse property → Click "Unlock Contact" → Pay ₹50
# Use test card: 4111111111111111 (CVV: 123, Exp: 12/25)
```

### 4. Deploy to Vercel

```bash
# Add env vars to Vercel
vercel env add NEXT_PUBLIC_PAYMENT_GATEWAY
vercel env add NEXT_PUBLIC_CASHFREE_APP_ID
vercel env add CASHFREE_KEY_SECRET

# Deploy
git push origin main
```

### 5. Configure Webhook

Cashfree Dashboard → Settings → Webhooks
- Add: `https://yourdomain.vercel.app/api/cashfree/webhook`
- Events: `Payment Success`, `Payment Failure`

### 6. Go Live

After KYC approval:
- Switch to **Live** keys in Vercel env vars
- Test with real payment

---

## File Reference

### New Files Created

| File | Purpose |
|------|---------|
| `app/api/cashfree/create-order/route.ts` | Create Cashfree payment order |
| `app/api/cashfree/verify/route.ts` | Verify payment signature |
| `app/api/cashfree/webhook/route.ts` | Handle Cashfree webhooks |
| `lib/payments.ts` | Payment gateway abstraction |
| `types/index.ts` | Updated with Cashfree types |
| `.env.local.example` | Updated env vars |
| `APP_STRUCTURE.md` | Complete folder structure |
| `CASHFREE_MIGRATION.md` | Detailed migration guide |

### Existing Files (Still Working)

- `app/api/razorpay/create-order/route.ts` (fallback)
- `app/api/razorpay/verify/route.ts` (fallback)
- `components/PaymentModal.tsx` (updated - supports both)

---

## Environment Variables Explained

```
┌─────────────────────────────────────────────┐
│ NEXT_PUBLIC_PAYMENT_GATEWAY                 │
│ ─────────────────────────────────────────   │
│ Which gateway to use: "cashfree"/"razorpay" │
│ Default: "cashfree"                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Cashfree (Primary)                          │
│ ─────────────────────────────────────────   │
│ NEXT_PUBLIC_CASHFREE_APP_ID                 │
│ CASHFREE_KEY_SECRET (⚠️ never in client)    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Razorpay (Fallback)                         │
│ ─────────────────────────────────────────   │
│ NEXT_PUBLIC_RAZORPAY_KEY_ID                 │
│ RAZORPAY_KEY_SECRET (⚠️ never in client)    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ NEXT_PUBLIC_APP_URL                         │
│ ─────────────────────────────────────────   │
│ For webhook: http://localhost:3000 (local)  │
│           or https://yourdomain.app (prod)  │
└─────────────────────────────────────────────┘
```

---

## Testing Checklist

### Local Testing

- [ ] `npm run dev` starts without errors
- [ ] Can login as tenant
- [ ] Can browse properties
- [ ] "Unlock Contact" button works
- [ ] PaymentModal opens on click
- [ ] Test payment completes successfully
- [ ] Firestore has payment record with `gateway: "cashfree"`
- [ ] Contact details are now visible

### Production Testing

- [ ] Deploy to Vercel successful
- [ ] All env vars set correctly in Vercel
- [ ] App loads on production URL
- [ ] Test payment flow end-to-end
- [ ] Webhook receives payment confirmation
- [ ] Firestore updated within 5 seconds
- [ ] No errors in Vercel logs

---

## Switching Gateways

### From Razorpay to Cashfree

```bash
# Local
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
npm run dev

# Production
vercel env set NEXT_PUBLIC_PAYMENT_GATEWAY cashfree
vercel redeploy
```

### From Cashfree to Razorpay (Emergency Fallback)

```bash
# If Cashfree is down
NEXT_PUBLIC_PAYMENT_GATEWAY=razorpay
vercel env set NEXT_PUBLIC_PAYMENT_GATEWAY razorpay
vercel redeploy --prod
```

Takes ~2 minutes to rollback.

---

## Payment Flow Diagram

```
User Clicks "Pay ₹50"
        ↓
Load Payment Gateway Script
        ↓
Call /api/{gateway}/create-order
        ↓
Get order ID from gateway
        ↓
Open Payment Form (Cashfree/Razorpay)
        ↓
User Submits Payment
        ↓
┌─ Cashfree ────────────┐  OR  ┌─ Razorpay ───────────┐
│ Webhook fires         │       │ Handler fires        │
│ /cashfree/webhook     │       │ (callback)           │
└───────────────────────┘       └──────────────────────┘
        ↓                               ↓
Call /api/{gateway}/verify
        ↓
Verify Signature
        ↓
✅ Success → Save to Firestore → Unlock contact
❌ Fail    → Show error message
```

---

## Troubleshooting

### Payment gateway doesn't load

```bash
# Check browser console (F12)
# Look for CORS errors or 404s

# Fix: Verify environment variables
echo $NEXT_PUBLIC_CASHFREE_APP_ID    # Should not be empty
echo $NEXT_PUBLIC_PAYMENT_GATEWAY    # Should be "cashfree"
```

### Signature verification fails

```bash
# Check that keys match between:
# 1. Dashboard (Cashfree/Razorpay)
# 2. .env.local
# 3. Vercel Settings

# Try sandbox credentials first
```

### Webhook not firing

```bash
# Check Cashfree Dashboard → Webhooks
# Verify URL is correct: https://yourdomain.app/api/cashfree/webhook

# If webhook fails, payment still records manually:
# Check Firestore → payments collection
```

### User gets Razorpay instead of Cashfree

```bash
# Wrong env var set
NEXT_PUBLIC_PAYMENT_GATEWAY=razorpay  ❌ Should be "cashfree"
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree  ✅ Correct
```

---

## Support Resources

| Need | Link |
|------|------|
| Cashfree Docs | https://docs.cashfree.com/ |
| Cashfree Dashboard | https://dashboard.cashfree.com/ |
| Cashfree Support | support@cashfree.com |
| Razorpay Docs | https://razorpay.com/docs/ |
| Razorpay Dashboard | https://dashboard.razorpay.com/ |

---

## Key Decisions

1. **Why Cashfree?**
   - Lower commission (2% vs 2.36%)
   - Better UPI support in tier-2/3 cities
   - Reliable webhook delivery

2. **Why keep Razorpay?**
   - Tested, production-ready
   - Quick fallback if needed
   - No code duplication needed

3. **Why feature flag?**
   - Switch providers without redeploying
   - A/B test different gateways
   - Emergency rollback in minutes

---

## Next Phase: Subscription Model

After reaching 5,000+ users with ₹50 micro-transactions:

1. Keep current payment flow
2. Add ₹99/month subscription option
3. A/B test: 50% micro vs 50% subscription
4. Measure LTV and churn
5. Decide: focus on one model or hybrid

Both Cashfree and Razorpay support subscriptions/recurring payments.
