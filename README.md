# வாடகைக்கு — Vaadagaiku

A mobile-first rental marketplace for Thanjavur (and beyond). Tenants browse properties with auto-play videos and unlock contact details for ₹50. Lenders list properties, upload videos, and track views.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Auth | Firebase Phone OTP |
| Database | Cloud Firestore |
| Storage | Firebase Storage (videos) |
| Payments | Razorpay |
| Hosting | Vercel |

---

## Folder Structure

```
vaadagaiku/
├── app/
│   ├── login/page.tsx          # OTP login
│   ├── role-select/page.tsx    # Pick Tenant / Lender
│   ├── tenant/page.tsx         # Browse & unlock properties
│   ├── lender/
│   │   ├── page.tsx            # My listings dashboard
│   │   └── add-property/page.tsx
│   ├── api/razorpay/
│   │   ├── create-order/route.ts
│   │   └── verify/route.ts
│   ├── layout.tsx
│   ├── page.tsx                # Auth-aware redirect
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── PropertyCard.tsx        # Video + unlock flow
│   ├── PaymentModal.tsx        # Razorpay integration
│   ├── FilterBar.tsx
│   └── LoadingSpinner.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── firebase.ts
├── types/
│   └── index.ts
├── firestore.rules
├── .env.local.example
└── README.md
```

---

## Setup Guide

### Step 1 — Clone & Install

```bash
cd vaadagaiku
npm install
```

### Step 2 — Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create project** → name it `vaadagaiku`
2. **Authentication** → Sign-in method → Enable **Phone**
3. **Firestore Database** → Create database → Start in **production mode**
4. **Storage** → Get started
5. **Project Settings** → Your apps → Add web app → Copy the config

### Step 3 — Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Dashboard → Settings → **API Keys** → Generate test keys
3. Copy `Key ID` and `Key Secret`

### Step 4 — Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in all values from Steps 2 & 3.

### Step 5 — Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, paste the contents of `firestore.rules` and click **Publish**.

### Step 6 — Firebase Storage Rules

In Firebase Console → Storage → **Rules** tab, paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 100 * 1024 * 1024
        && request.resource.contentType.matches('video/.*');
    }
  }
}
```

### Step 7 — Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

For testing OTP locally, add test phone numbers in Firebase Console → Authentication → Sign-in method → Phone → **Test phone numbers**.

---

## Deployment (Vercel)

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow prompts. When asked for environment variables, add all values from `.env.local`.

### Option B — GitHub + Vercel Dashboard

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vaadagaiku.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo

3. In **Environment Variables**, add all variables from `.env.local.example`

4. Click **Deploy**

### After Deployment

Update Firebase Authorized Domains:
- Firebase Console → Authentication → Settings → **Authorized domains**
- Add your Vercel URL: `vaadagaiku.vercel.app`

---

## Database Schema

### `users/{uid}`
```
name: string
phone: string          // +91XXXXXXXXXX
role: "tenant" | "lender"
createdAt: timestamp
```

### `properties/{id}`
```
userId: string
lenderName: string
title: string
description: string
rent: number           // monthly in ₹
location: string       // area (shown publicly)
address: string        // full address (locked)
phone: string          // contact (locked)
videoUrl: string
views: number
featured: boolean
available: boolean
createdAt: timestamp
```

### `payments/{userId_propertyId}`
```
userId: string
propertyId: string
amount: 50
razorpayOrderId: string
razorpayPaymentId: string
razorpaySignature: string
status: "completed"
createdAt: timestamp
```

---

## Monetization Phases

| Phase | Model | Status |
|-------|-------|--------|
| 1 | Free listings | ✅ Live |
| 2 | ₹50 contact unlock | ✅ Live |
| 3 | Featured listings (paid) | Ready (toggle in Firestore) |
| 4 | In-app ads | Planned |

---

## Going Live with Razorpay

1. Complete KYC on Razorpay Dashboard
2. Switch from test keys (`rzp_test_...`) to live keys (`rzp_live_...`) in `.env.local` / Vercel env
3. Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

---

## WhatsApp Sharing

Each property card can be shared via the native share API. Add a share button to `PropertyCard.tsx`:

```tsx
navigator.share({ title: property.title, url: window.location.href })
```
