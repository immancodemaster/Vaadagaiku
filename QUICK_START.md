# Quick Start - Cashfree Setup in 15 Minutes

Copy-paste commands below in order.

---

## Step 1: Cashfree Account (5 mins)

```
Visit: https://dashboard.cashfree.com/
→ Sign up
→ Settings → API Keys
→ Copy these from SANDBOX section:
   - App ID (something like: b52dfd4c95d9ac001ca30ae6e8e901)
   - Key Secret (something like: 7c9869c80f6a5b4f1e2d3c4a5b6c7d8e)
```

---

## Step 2: Update Environment Variables (2 mins)

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and paste:
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
NEXT_PUBLIC_CASHFREE_APP_ID=<paste_your_app_id>
CASHFREE_KEY_SECRET=<paste_your_key_secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=<keep_existing>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<keep_existing>
# ... (keep all other Firebase vars)
```

---

## Step 3: Test Locally (3 mins)

```bash
# Start dev server
npm run dev

# Open http://localhost:3000 in browser
# → Login with phone number
# → Go to Tenant → Select any property
# → Click "Unlock Contact" button
# → Payment modal opens with Cashfree
# → Test card: 4111111111111111
#    CVV: 123
#    Exp: 12/25
# → Click Pay → Should succeed ✅
```

---

## Step 4: Verify in Firestore (1 min)

```
1. Go to Firebase Console → Your Project
2. Firestore Database → payments collection
3. Should see new document: {userId}_{propertyId}
4. Check fields:
   ✅ gateway: "cashfree"
   ✅ status: "completed"
   ✅ amount: 50
   ✅ createdAt: current time
```

---

## Step 5: Deploy to Vercel (3 mins)

**Via CLI (recommended):**
```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_PAYMENT_GATEWAY
# → Type: cashfree

vercel env add NEXT_PUBLIC_CASHFREE_APP_ID
# → Paste: your app id from Cashfree

vercel env add CASHFREE_KEY_SECRET
# → Paste: your key secret (should NOT be visible)

vercel env add NEXT_PUBLIC_APP_URL
# → Type: https://your-domain.vercel.app

# Redeploy with new env vars
vercel redeploy --prod
```

**Or via Dashboard:**
```
1. vercel.com → Your Project → Settings
2. Environment Variables
3. Add each var manually
4. Deployments → Redeploy
```

---

## Step 6: Configure Webhook (2 mins)

```
1. Go to Cashfree Dashboard
2. Settings → Webhooks (or Notifications)
3. Add URL: https://your-domain.vercel.app/api/cashfree/webhook
4. Events: Select "Payment Success" and "Payment Failure"
5. Save
```

---

## Done! ✅

Test on production:
```
1. Go to https://your-domain.vercel.app
2. Login → Browse property → Unlock Contact
3. Complete payment with real card or test card
4. Contact details should unlock instantly
```

---

## Test Cards (Sandbox)

| Card Type | Number | CVV | Exp | Status |
|-----------|--------|-----|-----|--------|
| Visa | 4111111111111111 | 123 | 12/25 | ✅ Success |
| Visa | 4444444444444440 | 123 | 12/25 | ❌ Failure |
| Mastercard | 5555555555554444 | 123 | 12/25 | ✅ Success |
| Amex | 378282246310005 | 123 | 12/25 | ✅ Success |

---

## Troubleshooting

### "Payment failed to load"
```bash
# Check console (F12 → Console)
# If CORS error, check:
echo $NEXT_PUBLIC_CASHFREE_APP_ID  # Should NOT be empty
```

### "Invalid signature"
```bash
# Wrong secret key in .env.local
# Verify in Cashfree Dashboard → API Keys
# Double-check: no spaces, exact copy
```

### "Can't reach webhook"
```bash
# Check Cashfree Dashboard → Webhooks
# URL should be: https://your-domain.vercel.app/api/cashfree/webhook
# NOT http (must be https)
# NOT localhost
```

### Still on Razorpay?
```bash
# Wrong gateway set
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree  # ← Should be this
```

---

## Next: Go Live in 2 Weeks

After testing with sandbox for 2-3 days:

1. **Complete KYC** (Cashfree Dashboard → KYC)
   - Upload business documents
   - Wait for approval (24-72 hours)

2. **Get Live Keys** (Cashfree Dashboard → API Keys → PRODUCTION)
   - Copy live App ID
   - Copy live Key Secret

3. **Update Vercel** (Vercel Settings → Environment Variables)
   ```bash
   NEXT_PUBLIC_CASHFREE_APP_ID=<LIVE_ID>
   CASHFREE_KEY_SECRET=<LIVE_SECRET>
   ```

4. **Test Real Payment**
   - Make a ₹50 real transaction
   - Verify it works

5. **Launch!** 🚀
   - Share app with users
   - Start collecting real payments

---

## Commands Cheatsheet

```bash
# Start dev
npm run dev

# Check environment
echo $NEXT_PUBLIC_CASHFREE_APP_ID
echo $CASHFREE_KEY_SECRET

# Deploy to Vercel
vercel redeploy --prod

# Check Vercel env vars
vercel env list

# Rollback to Razorpay (emergency)
vercel env set NEXT_PUBLIC_PAYMENT_GATEWAY razorpay
vercel redeploy --prod
```

---

## Support

- **Cashfree Issues**: https://cashfree.com/support
- **Vercel Issues**: https://vercel.com/support
- **Code Issues**: Check CASHFREE_MIGRATION.md

---

**You got this! 💪**
