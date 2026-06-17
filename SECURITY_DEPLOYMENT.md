# 🔒 Security Fixes Deployment Guide
## Vaadagaiku - Critical Security Updates

**Date:** 2026-06-17  
**Status:** READY TO DEPLOY  
**Severity:** CRITICAL  

---

## Overview

Three critical security vulnerabilities have been fixed:

1. ✅ **Payment verification moved to backend** (was client-side, exploitable)
2. ✅ **Firestore security rules hardened** (blocked unsafe writes)
3. ✅ **Environment variables secured** (no secrets in frontend)

---

## 🚨 What Was Fixed

### Before (VULNERABLE)
```typescript
// ❌ Client-side payment recording (DANGEROUS)
onSuccess(property.phone, property.address); // Unlocked without verification!
```

### After (SECURE)
```typescript
// ✅ Backend verification required
const verifyRes = await fetch('/api/cashfree/verify-unlock', {...});
// Backend verifies payment via Cashfree API using server-side CASHFREE_KEY_SECRET
// Only then does unlock happen
```

---

## 📋 Deployment Checklist

### Step 1: Deploy Firestore Rules (10 mins)

```bash
# Option A: Using Firebase CLI
firebase deploy --only firestore:rules

# Option B: Manual via Firebase Console
# 1. Go to Firebase Console → Firestore → Rules
# 2. Copy content from firestore.rules
# 3. Click "Publish"
```

**Verify Rules Deployed:**
```bash
firebase rules:list
# Should show updated timestamp
```

---

### Step 2: Deploy Backend API (5 mins)

The new backend verification endpoint is already created:
- File: `app/api/cashfree/verify-unlock/route.ts`
- No additional setup needed, just deploy to Vercel

```bash
# Commit and push to trigger Vercel auto-deploy
git add app/api/cashfree/verify-unlock/route.ts
git commit -m "fix(security): add Cashfree backend payment verification"
git push origin main
```

**Verify API Deployed:**
```bash
curl -X POST https://vaadagaiku.vercel.app/api/cashfree/verify-unlock \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","propertyId":"test","orderId":"test"}' 
# Should return 400 (missing fields) - API is live!
```

---

### Step 3: Deploy Frontend Changes (5 mins)

The PaymentModal.tsx has been updated to use backend verification:

```bash
# Already included in git push above
git add components/PaymentModal.tsx
```

---

### Step 4: Environment Variables (CRITICAL)

**Verify Vercel has these secrets set:**

```bash
# Check what's configured
vercel env list

# Should show:
# NEXT_PUBLIC_FIREBASE_API_KEY         ✓ (public, okay)
# NEXT_PUBLIC_CASHFREE_APP_ID         ✓ (public, okay)  
# CASHFREE_KEY_ID                     ✓ (secret, NOT public)
# CASHFREE_KEY_SECRET                 ✓ (secret, NOT public)
```

**Set secrets in Vercel Dashboard:**
```
Settings → Environment Variables → Add:
- CASHFREE_KEY_ID = [your Cashfree Key ID]
- CASHFREE_KEY_SECRET = [your Cashfree Key Secret]

Make sure they are NOT marked as "NEXT_PUBLIC_"
```

**Verify locally:**
```bash
# In .env.local (NEVER commit this)
CASHFREE_KEY_ID=your_key_id_here
CASHFREE_KEY_SECRET=your_key_secret_here

# Check it's in .gitignore
cat .gitignore | grep .env
# Should show: .env.local
```

---

### Step 5: Test the Changes

**Test 1: Verify Payment Fails with Wrong Signature**
```bash
# This should FAIL (401 unauthorized)
curl -X POST http://localhost:3001/api/razorpay/verify-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId":"order_123",
    "razorpayPaymentId":"pay_123",
    "razorpaySignature":"fake_signature",
    "userId":"user_123",
    "propertyId":"prop_123"
  }'

# Expected response:
# {"success": false, "error": "Payment verification failed"}
```

**Test 2: Verify Firestore Rules Block Client Writes**
```typescript
// This should FAIL (permission denied)
const db = getFirestore();
await setDoc(doc(db, 'payments', 'test'), {
  userId: user.uid,
  propertyId: 'prop_123',
  status: 'completed', // ❌ Will be blocked
});

// Expected error:
// "Error: Missing or insufficient permissions"
```

**Test 3: Verify Payment Flow End-to-End**
```
1. Navigate to tenant page
2. Click "Unlock Contact" on a property
3. Complete Razorpay payment
4. Verify contact info appears
5. Check Firestore: payments collection has new record with verified signature
```

---

## 📊 Security Verification Checklist

- [ ] Firestore rules deployed
- [ ] Backend API deployed to Vercel
- [ ] Frontend using backend verification
- [ ] Environment secrets set in Vercel (NOT in code)
- [ ] Payment verification tests pass
- [ ] Firestore rules tests pass
- [ ] No RAZORPAY_KEY_SECRET in frontend code
- [ ] No CASHFREE_KEY_SECRET in frontend code
- [ ] .env.local in .gitignore
- [ ] Git history has no exposed secrets (if it does, rotate keys)

---

## 🚨 Critical Security Rules

### DO ✅
- Keep `RAZORPAY_KEY_SECRET` server-side only
- Keep `CASHFREE_KEY_SECRET` server-side only
- Always verify signatures on backend
- Use Firestore rules as first line of defense
- Log suspicious payment attempts
- Rotate keys if ever exposed

### DON'T ❌
- Expose `RAZORPAY_KEY_SECRET` to frontend
- Expose `CASHFREE_KEY_SECRET` to frontend
- Trust client-side payment verification
- Allow direct writes to payments collection
- Log full signatures/keys
- Commit .env.local files

---

## 🧪 Testing Command (Local)

```bash
# Start dev server
npm run dev

# In another terminal, test the API
# 1. Get a valid Cashfree order ID from a real payment
# 2. Call the verify endpoint:
curl -X POST http://localhost:3000/api/cashfree/verify-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "orderId":"order_XXX",
    "paymentId":"pay_XXX",
    "userId":"user_uid",
    "propertyId":"property_id"
  }'

# Expected response (on success):
# {"success": true, "contact": {"phone":"...", "address":"..."}}

# Expected response (on missing fields):
# {"success": false, "error": "Missing required fields"}
```

---

## 📋 Files Changed

| File | Change | Status |
|------|--------|--------|
| `firestore.rules` | Hardened rules, blocked unsafe writes | ✅ Done |
| `app/api/cashfree/verify-unlock/route.ts` | New Cashfree backend verification | ✅ Done |
| `components/PaymentModal.tsx` | Use backend verification | ✅ Done |
| `.env.local.example` | Document secret vars | ⏳ Next |
| `.gitignore` | Ensure .env.local ignored | ⏳ Check |

---

## 🔍 Verification Commands

### Check Firestore Rules Are Live
```bash
firebase rules:list --project your-project-id
```

### Check Backend API Responds
```bash
curl https://vaadagaiku.vercel.app/api/cashfree/verify-unlock \
  -X POST -H "Content-Type: application/json" \
  -d '{"userId":"test"}' 
# Should return 400 (missing fields) - API is live!
```

### Check No Secrets in Frontend
```bash
# Search for exposed keys
grep -r "CASHFREE_KEY_ID" src/
grep -r "CASHFREE_KEY_SECRET" src/
# Should return NOTHING

grep -r "CASHFREE_KEY_ID" components/
grep -r "CASHFREE_KEY_SECRET" components/
# Should return NOTHING
```

---

## 🚀 Deployment Steps Summary

```bash
# 1. Make sure all changes are committed
git add .
git status  # verify staging

# 2. Deploy rules via Firebase CLI
firebase deploy --only firestore:rules

# 3. Push to Vercel (auto-deploys API + Frontend)
git push origin main

# 4. Wait for Vercel deployment (2-3 mins)
vercel status

# 5. Set environment variables in Vercel Dashboard:
# - CASHFREE_KEY_ID
# - CASHFREE_KEY_SECRET

# 6. Run security verification tests
# (See testing section above)

# 7. Monitor logs for payment failures
vercel logs
```

---

## 📞 Rollback Plan (If Needed)

If something goes wrong:

```bash
# Rollback Firestore rules to previous version
firebase rules:rollback

# Rollback Vercel deployment
vercel rollback

# Or revert commit
git revert <commit-hash>
git push origin main
```

---

## 🎯 Success Criteria

After deployment:
- ✅ Payment unlocks work (happy path)
- ✅ Invalid signatures fail (401 error)
- ✅ Client cannot write to payments collection
- ✅ Firestore rules enforce security
- ✅ No secrets in git history
- ✅ Backend verifies all payments
- ✅ Logs show verification timestamp

---

## ⚠️ Known Limitations

1. **Existing Payment Records**: Old payments recorded directly in Firestore (before backend verification) don't have signature verification. They're okay, but new payments are safer.

2. **Migration**: If you need to verify old payments, add a cloud function to backfill signature verification (optional).

3. **Monitoring**: Add logging to track:
   - How many payments are verified
   - How many signature validations fail
   - Suspicious patterns

---

## 📝 Next Steps After Deployment

1. **Monitor** payment transactions for 24-48 hours
2. **Log** verification failures and investigate
3. **Alert** if unusual patterns detected
4. **Document** security improvements in runbook
5. **Plan** additional security measures (rate limiting, fraud detection)

---

## 💬 Questions?

If deployment fails:
1. Check Vercel deployment logs
2. Check Firebase rules validation
3. Verify environment variables are set
4. Test API locally first
5. Check .gitignore includes .env.local

---

**Estimated Deployment Time: 15 minutes**

**Risk Level: LOW** (no user-facing changes, just security hardening)

**Rollback Risk: VERY LOW** (easy to revert if needed)

---

*Last updated: 2026-06-17*
