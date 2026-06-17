# வாடகைக்கு (Vaadagaiku) — Project Documentation

> "Rent Simplified · Thanjavur"
> Live URL: https://vaadagaiku.vercel.app

---

## என்ன செய்திருக்கோம் (What We Built)

Thanjavur மற்றும் சுற்றியுள்ள பகுதிகளுக்கான **rental property marketplace** — full-stack web app.

Tenants வீடு தேடலாம், Lenders வீடு list பண்ணலாம், Admin எல்லாத்தையும் manage பண்ணலாம்.

---

## Tech Stack

| Layer | Tool | ஏன் use பண்ணோம் |
|-------|------|----------------|
| Frontend Framework | **Next.js 14** (App Router) | Fast, SEO-friendly, file-based routing |
| Language | **TypeScript** | Type safety, fewer bugs |
| Styling | **Tailwind CSS** | Mobile-first, fast styling |
| Auth | **Firebase Phone Auth** | OTP login — no password needed |
| Database | **Cloud Firestore** | Real-time NoSQL, free tier generous |
| File Storage | **Firebase Storage** | Video upload (100MB per property) |
| Payments | **Razorpay** | Indian payment gateway, UPI/card support |
| Hosting | **Vercel** | Free hosting, auto-deploy, global CDN |
| Icons | **Lucide React** | Clean, consistent icon set |

---

## யாருக்கு என்ன (User Roles)

### Tenant (வீடு தேடுபவர்)
- Phone OTP login
- Browse all available properties
- Filter by location, rent, type (residential/commercial)
- 👍 Like properties
- ❤️ Save properties to wishlist
- Double-tap video to like
- Pay ₹50 to unlock owner contact + full address
- Get directions to property via Google Maps
- Saved/Liked properties list — separate page

### Lender / Owner (வீடு கொடுப்பவர்)
- Phone OTP login
- Add property with:
  - Video upload (up to 100MB)
  - Title, description, rent, location
  - Full address (hidden until unlock)
  - Contact phone (hidden until unlock)
  - Property type: Residential / Commercial
  - GPS location (📍 Use My Current Location)
- Edit / Delete listings
- Mark property as Available ✅ or Occupied 🏠
- Feature listing (shows first in feed)
- See 👍 likes + ❤️ saves count per listing

### Admin (வாடகைக்கு Team)
- Separate login → `/admin` dashboard
- View all stats: lenders, tenants, listings, deals, revenue
- Properties by area table (Thanjavur, Karanthai, etc.)
- Verify properties after physical visit ✅
- Unverify if needed
- View all users (lenders + tenants)
- Track all deals (₹50 unlocks)
- Mark happy customers 😊
- Map page — properties with GPS shown on OpenStreetMap

---

## Features List

### Authentication
- Phone number OTP (Firebase Phone Auth)
- Role selection BEFORE login: Tenant or Owner
- New user → name entry step
- Existing user → direct to dashboard
- Admin role → `/admin` dashboard
- Session persists across browser refresh

### Property Listing
- Video autoplay on scroll (Intersection Observer API)
- Video download disabled (controlsList="nodownload")
- Featured properties appear first
- Real-time updates (Firestore onSnapshot)
- No composite indexes needed (client-side sort)

### Payment Flow
- Tenant clicks "Unlock Contact · ₹50"
- Razorpay payment modal opens
- Payment verified server-side (HMAC signature)
- Contact + address revealed after successful payment
- Copy phone number button

### Verified Badge
- Admin visits property physically, checks documents
- Admin clicks ✅ Verify in admin panel
- Property gets blue "✅ Verified" badge on video
- Tenant sees "Verified by Vaadagaiku Team" banner

### Maps & Directions
- Lender adds GPS at property location
- Tenant (after unlock) → "📍 Get Directions"
- Opens Google Maps with route from tenant's location to property
- No Google Maps API key needed

### Occupied Status
- Lender marks property as 🏠 Occupied
- Disappears from tenant feed immediately
- Shows in tenant's saved/liked list with red "OCCUPIED" banner
- Tenant informed visually

---

## UI Design Approach

### Design Philosophy
- **Mobile-first** — designed for phone screens first
- **Orange (#f97316)** as primary color — warm, trustworthy, Indian aesthetic
- **Card-based layout** — each property as a card with rounded corners
- **Bottom padding** — 80px bottom on all pages (for phone navigation)

### Key Design Decisions
| Decision | Reason |
|----------|--------|
| Full-screen video (16:9 ratio) | Property videos look like Instagram reels |
| Sticky orange header | Always visible, consistent branding |
| Pill-shaped filter buttons | Easy to tap on mobile |
| Large CTA buttons (py-3) | Thumb-friendly touch targets |
| Tamil title "வாடகைக்கு" | Local connection, trust |
| Orange → white gradient flow | Premium feel without being heavy |

### Component Library
- `PropertyCard` — video + like/save + rent + unlock button
- `PropertyDetailModal` — bottom sheet with full details + directions
- `PaymentModal` — Razorpay payment flow
- `FilterBar` — location + rent range + property type filters
- `Navbar` — sticky header with bookmark icon for tenant
- `LoadingSpinner` — consistent loading UI
- `AdminMapView` — OpenStreetMap + property list

### Admin UI
- Dark sidebar (#1f2937) on desktop
- Bottom nav bar on mobile (5 tabs)
- Orange active state
- Clean data tables with filter pills

---

## Database Structure (Firestore)

### `users` collection
```
{
  id: UID,
  name: "Ravi Kumar",
  phone: "+918610042353",
  role: "tenant" | "lender" | "admin",
  createdAt: timestamp
}
```

### `properties` collection
```
{
  id: auto,
  userId: lender UID,
  lenderName: "Ravi",
  title: "2 BHK near Bus Stand",
  description: "...",
  propertyType: "residential" | "commercial",
  rent: 8500,
  location: "Karanthai",
  address: "hidden until unlock",
  phone: "hidden until unlock",
  videoUrl: "firebase storage URL",
  lat: 10.7870,  // optional GPS
  lng: 79.1378,
  views: 26,
  likesCount: 5,
  savesCount: 3,
  featured: false,
  available: true,
  verified: false,
  verifiedAt: timestamp,
  verifiedBy: admin UID,
  createdAt: timestamp
}
```

### `payments` collection
```
{
  userId: tenant UID,
  propertyId: property ID,
  amount: 50,
  razorpayOrderId: "...",
  razorpayPaymentId: "...",
  razorpaySignature: "...",
  status: "completed",
  happy: false,
  createdAt: timestamp
}
```

### `saves` collection
```
{ userId, propertyId, createdAt }
// Document ID = {userId}_{propertyId}
```

### `likes` collection
```
{ userId, propertyId, createdAt }
// Document ID = {userId}_{propertyId}
```

---

## Security (Firestore Rules)

- Users can only read/write their own data
- Properties: owner can edit, anyone logged in can read
- Only admin can verify properties
- Views, likes, saves — any logged-in user can increment
- Payments: only owner can read their own, only admin can update
- Admin identified by `role: "admin"` in Firestore

---

## Folder Structure

```
Vaadagaiku/
├── app/
│   ├── page.tsx              # Root — redirects by role
│   ├── login/page.tsx        # OTP login (4-step flow)
│   ├── tenant/
│   │   ├── page.tsx          # Property feed
│   │   └── saved/page.tsx    # Liked & Saved lists
│   ├── lender/
│   │   ├── page.tsx          # My Listings
│   │   ├── add-property/     # Add new listing
│   │   └── edit-property/    # Edit existing
│   ├── admin/
│   │   ├── layout.tsx        # Sidebar + auth guard
│   │   ├── page.tsx          # Stats dashboard
│   │   ├── properties/       # Verify properties
│   │   ├── users/            # User management
│   │   ├── deals/            # Deal tracking
│   │   └── map/              # Property map
│   └── api/razorpay/
│       ├── create-order/     # Create Razorpay order
│       └── verify/           # Verify payment signature
├── components/
│   ├── PropertyCard.tsx      # Main listing card
│   ├── PropertyDetailModal.tsx # Bottom sheet detail view
│   ├── PaymentModal.tsx      # ₹50 unlock payment
│   ├── FilterBar.tsx         # Tenant search filters
│   ├── Navbar.tsx            # Top navigation
│   ├── LoadingSpinner.tsx    # Loading indicator
│   └── AdminMapView.tsx      # Map with property pins
├── contexts/
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   └── firebase.ts           # Firebase config
├── types/
│   └── index.ts              # TypeScript interfaces
└── firestore.rules           # Security rules
```

---

## Deployment

| Service | Details |
|---------|---------|
| Hosting | Vercel (free tier) |
| URL | vaadagaiku.vercel.app |
| Auto-deploy | Yes — `npx vercel deploy --prod` |
| Environment Variables | Set in Vercel dashboard |

### Environment Variables (Vercel)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

---

## Revenue Model

| Source | Amount | Notes |
|--------|--------|-------|
| Contact Unlock | ₹50/unlock | Tenant pays to see phone + address |
| Featured Listing | ₹150/month | Lender pays to show listing first |
| Verified Badge | Service fee | Vaadagaiku team visits, charges lender |
| Commission | 5% of first month rent | After successful deal |

Current: ₹50 unlock is active. Others planned.

---

## Pending (Not Yet Done)

- [ ] Razorpay live keys (currently placeholder)
- [ ] Firebase Authorized Domain: `vaadagaiku.vercel.app`
- [ ] Firestore Rules deployed (latest version with admin + likes)
- [ ] Google Play Store (TWA / PWA packaging)
- [ ] Instagram/Facebook ads campaign
- [ ] Push notifications (FCM)
- [ ] Featured listing payment flow

---

## Admin Setup (One-Time)

1. Login with real phone number on vaadagaiku.vercel.app
2. Firebase Console → Firestore → `users` collection
3. Find your UID document
4. Change `role` from `"lender"` to `"admin"`
5. Logout → Login → auto-redirect to `/admin`

---

*Built with Claude Code · May 2026*
