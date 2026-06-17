# Cashfree Migration Guide

## Overview

This guide walks you through migrating from Razorpay to Cashfree while maintaining Razorpay as a fallback.

**Timeline:** 2-3 days for full integration and testing

---

## Step 1: Cashfree Account Setup

### 1.1 Create Merchant Account

1. Go to [Cashfree Dashboard](https://dashboard.cashfree.com/)
2. Sign up or log in
3. Complete KYC verification (required for live payments)

### 1.2 Get API Credentials

1. **Dashboard** → **Settings** → **API Keys**
2. Copy these from **Sandbox/Test** section:
   - `App ID` (store as `NEXT_PUBLIC_CASHFREE_APP_ID`)
   - `Key Secret` (store as `CASHFREE_KEY_SECRET`)

3. Copy these from **Production** section (for later):
   - `App ID` (for live payments)
   - `Key Secret` (for live payments)

**⚠️ Important:** Keep secrets in `.env.local`, never commit to git.

---

## Step 2: Code Updates

### 2.1 Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your Vercel URL in production

# Cashfree (primary)
NEXT_PUBLIC_CASHFREE_APP_ID=<your_cashfree_app_id>
CASHFREE_KEY_SECRET=<your_cashfree_key_secret>

# Razorpay (fallback - optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
```

### 2.2 Copy API Routes

The following files should already exist (created by setup):

✅ `app/api/cashfree/create-order/route.ts`
✅ `app/api/cashfree/verify/route.ts`
✅ `app/api/cashfree/webhook/route.ts`

**Keep existing Razorpay routes for fallback:**
- `app/api/razorpay/create-order/route.ts`
- `app/api/razorpay/verify/route.ts`

### 2.3 Update PaymentModal Component

The component already supports both gateways. It will automatically use Cashfree based on the `NEXT_PUBLIC_PAYMENT_GATEWAY` env var.

### 2.4 Update Types

Types already updated to include Cashfree response types in `types/index.ts`.

### 2.5 Add Payment Service

The payment service utility is already created in `lib/payments.ts`.

---

## Step 3: Verify Installation

### 3.1 Check Dependencies

```bash
npm list razorpay  # Should exist (optional)
# No explicit Cashfree package needed - loaded from CDN
```

### 3.2 Verify Files Created

```bash
# Check all new files exist
ls app/api/cashfree/              # Should have create-order, verify, webhook
ls lib/payments.ts                # Should exist
```

### 3.3 Check Import Paths

Verify all imports resolve correctly in your IDE:
- `@/lib/payments` → `lib/payments.ts` ✅
- `@/lib/firebase` → `lib/firebase.ts` ✅
- `@/contexts/AuthContext` → `contexts/AuthContext.tsx` ✅

---

## Step 4: Testing

### 4.1 Local Testing

```bash
# Set environment variables
export NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree

# Start dev server
npm run dev

# Test payment flow
# 1. Login as tenant
# 2. Browse properties
# 3. Click "Unlock Contact"
# 4. Click "Pay ₹50 & Unlock"
# 5. Complete payment in Cashfree sandbox
```

### 4.2 Cashfree Sandbox Testing

Use test cards:

| Card Type | Number | CVV | Exp |
|-----------|--------|-----|-----|
| Visa | `4111111111111111` | `123` | `12/25` |
| Mastercard | `5555555555554444` | `123` | `12/25` |

### 4.3 Firestore Verification

After successful payment, verify the record in Firestore:

```
payments/{userId}_{propertyId}
├── userId: string
├── propertyId: string
├── amount: 50
├── cashfreeOrderId: string
├── cashfreeTransactionId: string
├── gateway: "cashfree"
├── status: "completed"
└── createdAt: timestamp
```

---

## Step 5: Deployment to Vercel

### 5.1 Set Environment Variables in Vercel

```bash
# Option A: Via Vercel Dashboard
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add all variables from .env.local:
   - NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
   - NEXT_PUBLIC_CASHFREE_APP_ID=<value>
   - CASHFREE_KEY_SECRET=<value>
   - NEXT_PUBLIC_APP_URL=https://vaadagaiku.vercel.app
   - NEXT_PUBLIC_RAZORPAY_KEY_ID=<value> (optional)
   - RAZORPAY_KEY_SECRET=<value> (optional)
```

```bash
# Option B: Via Vercel CLI
vercel env add NEXT_PUBLIC_PAYMENT_GATEWAY
vercel env add NEXT_PUBLIC_CASHFREE_APP_ID
# ... etc
```

### 5.2 Deploy

```bash
git add -A
git commit -m "Add Cashfree payment gateway"
git push origin main

# Vercel auto-deploys from main branch
```

### 5.3 Update Cashfree Webhook URL

1. Cashfree Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://vaadagaiku.vercel.app/api/cashfree/webhook`
3. Select events: `Payment Success`, `Payment Failure`

---

## Step 6: Go Live (Switch from Sandbox to Production)

### 6.1 Complete KYC in Cashfree

1. Cashfree Dashboard → **KYC** section
2. Upload business documents
3. Wait for verification (24-72 hours)

### 6.2 Switch to Live Keys

Once KYC is approved:

```bash
# In Vercel Settings → Environment Variables
NEXT_PUBLIC_CASHFREE_APP_ID=<LIVE_APP_ID>    # Switch from sandbox ID
CASHFREE_KEY_SECRET=<LIVE_KEY_SECRET>        # Switch from sandbox secret
```

### 6.3 Test Payment

Make a real payment with your live merchant account to confirm it works.

---

## Step 7: Monitoring

### 7.1 Check Payment Records

```
Firestore → payments collection
├── Filter by: gateway == "cashfree"
├── Verify: status == "completed"
└── Check: createdAt, amount
```

### 7.2 Monitor Errors

Check your Next.js logs for any errors:

```bash
# Vercel deployment logs
vercel logs  # or check in Vercel dashboard → Logs
```

### 7.3 Payment Reconciliation

Use Cashfree Dashboard to verify:
1. All payments are recorded
2. Amounts match (₹50 for property unlocks)
3. No failed/pending transactions

---

## Troubleshooting

### Issue: "Payment gateway failed to load"

**Cause:** Cashfree SDK script failed to load from CDN
**Fix:** Check browser console (F12 → Console)
- Verify network tab shows `sdk.cashfree.com` loading
- Check if your IP/region is blocked

### Issue: "Invalid signature" error

**Cause:** Signature verification failed
**Fix:**
1. Verify `CASHFREE_KEY_SECRET` is correct in `.env.local`
2. Check that `orderId` and `transactionId` match
3. Try sandbox credentials first

### Issue: Webhook not firing

**Cause:** Webhook URL not configured or unreachable
**Fix:**
1. Verify webhook URL in Cashfree Dashboard
2. Make it publicly accessible (not localhost)
3. Check Firestore for payment records (manual fallback works)

### Issue: User sees Razorpay instead of Cashfree

**Cause:** Wrong environment variable
**Fix:**
```bash
# Check what's set
echo $NEXT_PUBLIC_PAYMENT_GATEWAY

# Should be 'cashfree', not 'razorpay'
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
```

---

## Fallback to Razorpay

If Cashfree gateway is down or having issues:

```bash
# Quickly switch back
NEXT_PUBLIC_PAYMENT_GATEWAY=razorpay
# Redeploy
vercel
```

Users will see Razorpay payment form instead (assuming Razorpay is still configured).

---

## Comparison: Cashfree vs Razorpay

| Feature | Cashfree | Razorpay |
|---------|----------|----------|
| **Commission** | ~2% | ~2.36% |
| **Setup Time** | 1-2 days | 1-2 days |
| **KYC Required** | Yes | Yes |
| **Live Support** | Yes | Yes |
| **Webhook Delivery** | Reliable | Reliable |
| **Test Cards** | Provided | Provided |
| **UPI Support** | ✅ | ✅ |
| **Netbanking** | ✅ | ✅ |
| **Wallet** | ✅ | ✅ |

---

## Next Steps

1. ✅ Complete account setup
2. ✅ Deploy code to production
3. ✅ Test with sandbox credentials
4. ✅ Complete KYC verification
5. ✅ Switch to live keys
6. ✅ Test with real payment
7. ✅ Monitor transactions
8. → Remove Razorpay code (optional, after 2+ months)
9. → A/B test subscription model (later)

---

## Questions?

- **Cashfree Docs:** https://docs.cashfree.com/
- **Cashfree Support:** support@cashfree.com
- **Dashboard:** https://dashboard.cashfree.com/

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to Razorpay
NEXT_PUBLIC_PAYMENT_GATEWAY=razorpay

# Or rollback code
git revert <commit_hash>
vercel deploy
```

No data loss - both gateways write to the same Firestore payments collection.
