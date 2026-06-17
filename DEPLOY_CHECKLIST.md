# 🚀 Deployment Checklist - Vaadagaiku Security Fixes

**Date:** 2026-06-17  
**Status:** Ready for Production  
**Estimated Time:** 20 minutes  

---

## ✅ Pre-Deployment (DO NOW)

### 1. Firebase Setup
- [ ] Have Firebase CLI installed: `firebase --version`
- [ ] Have Firebase project created at https://console.firebase.google.com
- [ ] Have Firestore database created (Cloud Firestore)
- [ ] Run: `firebase login`

### 2. Vercel Setup
- [ ] Have Vercel account at https://vercel.com
- [ ] Have project connected to Vercel
- [ ] Know your Vercel project name

### 3. Cashfree Setup
- [ ] Have Cashfree merchant account
- [ ] Have `CASHFREE_KEY_ID` and `CASHFREE_KEY_SECRET`
- [ ] Have `NEXT_PUBLIC_CASHFREE_APP_ID` (public, safe to expose)

---

## 📋 Deployment Steps (Follow in Order)

### Step 1: Deploy Firestore Rules (5 mins)

```bash
firebase deploy --only firestore:rules
```

**What it does:**
- Blocks all client writes to payments collection
- Blocks all client writes to unlocks collection
- Only backend can write after verification
- Hardened security posture

**Verify:**
```bash
firebase rules:list
# Should show updated timestamp
```

---

### Step 2: Push Code to Vercel (5 mins)

```bash
git log --oneline -3
# Should show security fix commit

git push origin main
# (If no remote yet, add it: git remote add origin YOUR_REPO_URL)
```

**Vercel will auto-deploy:**
- Wait 2-3 minutes for deployment
- Check: https://vercel.com/dashboard → Select your project

---

### Step 3: Set Environment Variables in Vercel (3 mins)

**Go to:** Vercel Dashboard → Select Project → Settings → Environment Variables

**Add these Production variables:**

```
CASHFREE_KEY_ID = [your Cashfree Key ID]
CASHFREE_KEY_SECRET = [your Cashfree Key Secret]
```

**Make sure these already exist (public, safe):**
```
NEXT_PUBLIC_CASHFREE_APP_ID
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

**No Razorpay secrets should be here** (we're using Cashfree)

---

### Step 4: Test Payment Verification (3 mins)

**Locally:**
```bash
npm run dev
# Navigate to http://localhost:3000/login
```

**Or Production:**
```bash
# Go to https://vaadagaiku.vercel.app/login
```

**Test flow:**
1. Login as tenant
2. Click "Unlock Contact" on any property
3. Complete Cashfree payment
4. Verify contact info appears
5. Check Firebase Console → Firestore → payments collection
   - Should see new payment record with Cashfree response

---

### Step 5: Verify No Secrets in Code (2 mins)

```bash
# Search for exposed secrets
grep -r "CASHFREE_KEY_SECRET" src/
grep -r "CASHFREE_KEY_SECRET" components/
grep -r "CASHFREE_KEY_ID" src/
grep -r "CASHFREE_KEY_ID" components/

# Should return NOTHING
# (Secrets only in Vercel environment, never in code)
```

---

### Step 6: Check Git History (1 min)

```bash
git log --oneline -3
# Make sure .env.local is NOT in history

git show --name-status HEAD
# Check what files were committed
# .env.local should NOT be in the list
```

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Real Cashfree payments unlock contacts
- [ ] Invalid/failed payments show error
- [ ] Firestore records payment with Cashfree response
- [ ] Contact info appears after payment
- [ ] No errors in Vercel logs: `vercel logs --prod`
- [ ] Firebase rules are live: `firebase rules:list`
- [ ] No secrets in frontend source code

---

## 📊 What Changed

### Before (VULNERABLE ❌)
```typescript
// Client could skip payment verification
onSuccess(property.phone, property.address); 
// Client could create fake payments in Firestore
```

### After (SECURE ✅)
```typescript
// Backend must verify via Cashfree API
const verifyRes = await fetch('/api/cashfree/verify-unlock', {
  // Server verifies with CASHFREE_KEY_SECRET
  // Only then does unlock happen
});
```

---

## 🚨 Critical Security Rules

**DO:**
✅ Keep secrets only in Vercel environment  
✅ Always verify payments on backend  
✅ Use Firestore rules as first defense  
✅ Monitor payment logs  

**DON'T:**
❌ Expose `CASHFREE_KEY_SECRET` in code  
❌ Expose `CASHFREE_KEY_ID` in code  
❌ Trust client-side payment verification  
❌ Allow direct writes to payments collection  
❌ Commit `.env.local` to git  

---

## 🔄 Rollback Plan (If Needed)

If something breaks:

```bash
# Option 1: Rollback Vercel
vercel rollback

# Option 2: Rollback Firebase rules
firebase rules:rollback

# Option 3: Revert commit
git revert <commit-hash>
git push origin main
```

---

## 📞 Troubleshooting

### "Payment verification failed"
- Check Vercel environment variables are set
- Check API endpoint: `curl https://vaadagaiku.vercel.app/api/cashfree/verify-unlock`
- Check logs: `vercel logs --prod`

### "Firestore blocks payment write"
- Good! That's the security fix working
- Payments should only be written by backend

### "Secrets visible in logs"
- Immediately rotate keys
- Remove from git history: `git filter-branch`
- Update Vercel environment variables

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Deploy Firestore rules | 5 min | ⏳ |
| Push code to Vercel | 5 min | ⏳ |
| Set environment variables | 3 min | ⏳ |
| Test payment flow | 3 min | ⏳ |
| Verify no secrets | 2 min | ⏳ |
| Check git history | 1 min | ⏳ |
| **TOTAL** | **20 min** | 🟢 Ready |

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Firestore rules deployed
- ✅ Code pushed to Vercel (auto-deployed)
- ✅ Environment variables set
- ✅ Real payment unlocks contacts
- ✅ Invalid payment fails with 401
- ✅ No errors in logs
- ✅ All features work as before
- ✅ But now SECURE

---

## 📚 Documentation Files

- **SECURITY_ACTION_PLAN.md** ← Quick reference
- **SECURITY_DEPLOYMENT.md** ← Detailed guide
- **SECURITY_FIXES_SUMMARY.md** ← What was fixed
- **DEPLOY_CHECKLIST.md** ← This file

---

**Ready to deploy? Start with:**

```bash
firebase deploy --only firestore:rules
```

**Questions?** See SECURITY_DEPLOYMENT.md for detailed instructions.

---

*Last updated: 2026-06-17*
*Status: Ready for Production Deployment*
