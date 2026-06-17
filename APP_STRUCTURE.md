# Vaadagaiku App Structure

## Recommended Folder Organization

```
vaadagaiku/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── cashfree/              # Cashfree Payment Gateway
│   │   │   ├── create-order/route.ts
│   │   │   ├── verify/route.ts
│   │   │   └── webhook/route.ts   # Cashfree webhook for async payment confirmation
│   │   ├── razorpay/              # Razorpay (fallback/legacy)
│   │   │   ├── create-order/route.ts
│   │   │   └── verify/route.ts
│   │   └── auth/                  # Auth endpoints (future)
│   │       └── logout/route.ts
│   ├── (auth)/                    # Auth group layout
│   │   ├── login/page.tsx
│   │   └── role-select/page.tsx
│   ├── tenant/                    # Tenant pages
│   │   ├── page.tsx               # Browse properties
│   │   ├── saved/page.tsx         # Saved listings
│   │   └── layout.tsx
│   ├── lender/                    # Lender pages
│   │   ├── page.tsx               # My listings
│   │   ├── add-property/page.tsx
│   │   ├── edit-property/[id]/page.tsx
│   │   └── layout.tsx
│   ├── admin/                     # Admin dashboard (future)
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   ├── properties/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Auth-aware redirect
│   └── globals.css                # Global styles
│
├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx             # (new)
│   ├── Payment/                   # (new organization)
│   │   ├── PaymentModal.tsx
│   │   └── SlotPaymentModal.tsx
│   ├── Property/                  # (new organization)
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetailModal.tsx
│   │   └── FilterBar.tsx
│   ├── Venue/                     # (new organization)
│   │   ├── VenueCard.tsx
│   │   └── VenueDetailModal.tsx
│   ├── Common/                    # (new organization)
│   │   └── LoadingSpinner.tsx
│   └── Admin/                     # (new for future)
│       └── AdminMapView.tsx
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── PaymentContext.tsx         # (new - optional)
│
├── lib/
│   ├── firebase.ts                # Firebase initialization
│   ├── payments.ts                # (new) Payment gateway abstractions
│   ├── compressVideo.ts
│   ├── translations.ts
│   ├── constants.ts               # (new) App-wide constants
│   └── utils.ts                   # (new) Helper utilities
│
├── types/
│   ├── index.ts                   # All TypeScript types
│   ├── payment.ts                 # (new) Payment-specific types
│   └── property.ts                # (new) Property-specific types
│
├── hooks/                         # (new) Custom React hooks
│   ├── usePayment.ts              # Payment logic hook
│   └── useAuth.ts                 # Auth logic hook
│
├── styles/                        # (new) CSS/Tailwind organization
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── videos/
│
├── .env.local.example             # Environment variables example
├── .env.local                     # (gitignored) Actual environment variables
├── firestore.rules                # Firestore security rules
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Key Improvements

### 1. **Grouped API Routes**
- Payment providers are organized by gateway (cashfree, razorpay)
- Easy to switch or manage multiple providers
- Clear fallback structure

### 2. **Grouped Components**
- Components organized by feature area (Payment, Property, Venue, etc.)
- Easier to find and update related components
- Scales better as app grows

### 3. **Centralized Payment Logic**
- `lib/payments.ts` handles all payment verification
- Gateway-agnostic logic
- Environment variable controls which gateway to use

### 4. **New Folders for Scale**
- `hooks/` for custom React logic
- `styles/` for CSS organization
- `types/` split by domain (payment.ts, property.ts)

### 5. **Environment Variables**
- `.env.local.example` documents all required vars
- Both Cashfree and Razorpay configs available
- Easy to switch via `NEXT_PUBLIC_PAYMENT_GATEWAY`

---

## Migration Steps

### Phase 1: Structure Refactoring (Keep Existing Code)
```bash
# 1. Create new folders
mkdir -p components/Layout components/Payment components/Property components/Venue components/Common
mkdir -p lib hooks styles

# 2. Move existing components
mv components/Navbar.tsx components/Layout/
mv components/PaymentModal.tsx components/Payment/
mv components/PropertyCard.tsx components/Property/
mv components/PropertyDetailModal.tsx components/Property/
mv components/FilterBar.tsx components/Property/
mv components/VenueCard.tsx components/Venue/
mv components/LoadingSpinner.tsx components/Common/

# 3. Update imports in pages/components
# (Code will auto-update via TypeScript)
```

### Phase 2: Add Cashfree (Replace Razorpay)
```bash
# 1. Install Cashfree SDK (no npm package needed, it's loaded from CDN)

# 2. Copy the Cashfree API routes
# (Already provided in this guide)

# 3. Update PaymentModal.tsx
# (Already updated - supports both gateways)

# 4. Update .env.local
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree
NEXT_PUBLIC_CASHFREE_APP_ID=<your_app_id>
CASHFREE_KEY_SECRET=<your_key_secret>
```

### Phase 3: Testing
```bash
npm run dev
# Test payment flow with Cashfree
# Verify Razorpay still works (as fallback)
```

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_PAYMENT_GATEWAY` | Which gateway to use | `cashfree` or `razorpay` |
| `NEXT_PUBLIC_CASHFREE_APP_ID` | Cashfree merchant ID | `<provided by Cashfree>` |
| `CASHFREE_KEY_SECRET` | Cashfree secret key | `<provided by Cashfree>` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key ID (optional) | `<provided by Razorpay>` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (optional) | `<provided by Razorpay>` |
| `NEXT_PUBLIC_APP_URL` | App URL for webhooks | `https://vaadagaiku.vercel.app` |

---

## Future Additions

1. **Payment Context** - Share payment state across app
2. **usePayment Hook** - Simplify payment logic in components
3. **Logging Service** - Track payment events
4. **Error Boundary** - Graceful error handling
5. **Analytics** - Track payment conversion
6. **A/B Testing** - Test different payment models

---

## Notes

- Keep **old API routes** until migration is confirmed
- Use **feature flag** (`NEXT_PUBLIC_PAYMENT_GATEWAY`) to toggle providers
- Test both gateways before removing one
- Monitor **Firestore payment records** for accuracy
