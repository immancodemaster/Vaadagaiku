# Implementation Startup Guide
## Vaadagaiku - Project Setup & Initial Development

**Date:** 2026-06-17  
**Phase:** 1 (MVP & Payment Integration)  
**Status:** Ready to execute

---

## 1. Project Initialization (1 hour)

### Step 1.1: Clone/Initialize Repository

```bash
# Option A: If you already have a repo
cd ~/vaadagaiku
git status

# Option B: Start fresh (recommended)
mkdir -p ~/projects/vaadagaiku
cd ~/projects/vaadagaiku

# Initialize Next.js 14 (TypeScript)
npx create-next-app@14 . --typescript --tailwind --eslint
# Answers:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: Yes
# ✓ App Router: Yes
# ✓ Customize import alias: No

# Install additional dependencies
npm install
npm install firebase axios react-hook-form zustand sentry-sdk
```

### Step 1.2: Verify Installation

```bash
npm run dev
# Open http://localhost:3000
# Should see Next.js welcome page
```

---

## 2. Project Structure Setup (30 mins)

### Create Folder Organization

```bash
# Run from project root
mkdir -p src/{app/{api,auth},components/{Layout,Payment,Property,Venue,Common,Auth},lib,types,hooks,styles,__tests__}

# Verify structure
tree -L 3 src/
```

### Expected Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp/
│   │   │   │   └── route.ts
│   │   │   ├── verify-otp/
│   │   │   │   └── route.ts
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   ├── properties/
│   │   │   ├── list/
│   │   │   ├── detail/
│   │   │   ├── create/
│   │   │   └── update/
│   │   ├── payments/
│   │   │   ├── cashfree/
│   │   │   │   ├── create-order/
│   │   │   │   ├── verify/
│   │   │   │   └── webhook/
│   │   │   └── razorpay/
│   │   │       ├── create-order/
│   │   │       └── verify/
│   │   └── users/
│   │       ├── profile/
│   │       ├── unlocks/
│   │       └── saves/
│   │
│   ├── (routes)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (home)
│   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx (login)
│   │   ├── property/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (listing)
│   │   │   └── [id]/
│   │   │       └── page.tsx (detail)
│   │   ├── account/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (profile)
│   │   │   ├── unlocks/
│   │   │   ├── saves/
│   │   │   └── history/
│   │   └── owner/
│   │       ├── dashboard/
│   │       ├── create/
│   │       ├── manage/
│   │       └── inquiries/
│   │
│   ├── layout.tsx (root)
│   ├── globals.css
│   └── page.tsx
│
├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   └── Footer.tsx
│   │
│   ├── Payment/
│   │   ├── PaymentModal.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── SlotPaymentModal.tsx
│   │
│   ├── Property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetailModal.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── FilterBar.tsx
│   │   └── SearchBar.tsx
│   │
│   ├── Venue/
│   │   ├── VenueCard.tsx
│   │   └── VenueDetailModal.tsx
│   │
│   ├── Auth/
│   │   ├── OTPInput.tsx
│   │   ├── PhoneInput.tsx
│   │   └── AuthForm.tsx
│   │
│   └── Common/
│       ├── LoadingSpinner.tsx
│       ├── Modal.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── firebase.ts
│   ├── payments.ts
│   ├── auth.ts
│   ├── validation.ts
│   └── utils.ts
│
├── types/
│   └── index.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePayment.ts
│   ├── useProperties.ts
│   └── useUser.ts
│
├── styles/
│   └── globals.css
│
└── __tests__/
    ├── auth.test.ts
    ├── payments.test.ts
    └── properties.test.ts
```

---

## 3. Configuration Files (20 mins)

### 3.1 Create `.env.local.example`

```bash
cat > .env.local.example << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Vaadagaiku
NODE_ENV=development

# Payment Gateway
NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree  # or razorpay
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_KEY_SECRET=your_cashfree_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key

# Features (Feature Flags)
NEXT_PUBLIC_ENABLE_FEATURED_LISTINGS=false
NEXT_PUBLIC_ENABLE_SUBSCRIPTION=false
NEXT_PUBLIC_ENABLE_MESSAGING=false

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# External Services (Future)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
EOF

cp .env.local.example .env.local
echo ".env.local" >> .gitignore
```

### 3.2 Create `tsconfig.json` (already exists, verify paths)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@types/*": ["./src/types/*"],
      "@hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### 3.3 Create `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          light: "#FFE0CC",
          dark: "#CC4A1F",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4B5563",
          tertiary: "#9CA3AF",
        },
        bg: {
          DEFAULT: "#FFFFFF",
          light: "#F5F5F5",
        },
        semantic: {
          success: "#22C55E",
          error: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 4. Core Library Files (1 hour)

### 4.1 Create `src/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Get Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
```

### 4.2 Create `src/lib/payments.ts`

```typescript
export type PaymentGateway = 'cashfree' | 'razorpay'

export const getPaymentGateway = (): PaymentGateway => {
  return (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY as PaymentGateway) || 'cashfree'
}

export interface CreateOrderParams {
  amount: number
  propertyId: string
  userId: string
  orderId?: string
}

export interface PaymentVerificationParams {
  orderId: string
  paymentId?: string
}

export const createPaymentOrder = async (params: CreateOrderParams) => {
  const gateway = getPaymentGateway()
  
  if (gateway === 'cashfree') {
    return fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(res => res.json())
  } else {
    return fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(res => res.json())
  }
}

export const verifyPayment = async (params: PaymentVerificationParams) => {
  const gateway = getPaymentGateway()
  const endpoint = gateway === 'cashfree' ? '/api/cashfree/verify' : '/api/razorpay/verify'
  
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(res => res.json())
}
```

### 4.3 Create `src/lib/auth.ts`

```typescript
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut as firebaseSignOut 
} from "firebase/auth"
import { auth } from "./firebase"

export const setupRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('Recaptcha verified')
      },
      'expired-callback': () => {
        console.log('Recaptcha expired')
      }
    }, auth)
  }
  return window.recaptchaVerifier
}

export const sendOTP = async (phoneNumber: string) => {
  const appVerifier = window.recaptchaVerifier
  
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    )
    return confirmationResult
  } catch (error) {
    throw error
  }
}

export const verifyOTP = async (confirmationResult: any, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp)
    return result.user
  } catch (error) {
    throw error
  }
}

export const logout = async () => {
  return firebaseSignOut(auth)
}
```

### 4.4 Create `src/lib/validation.ts`

```typescript
// Phone number validation (Indian format)
export const isValidIndianPhone = (phone: string): boolean => {
  const regex = /^[6-9]\d{9}$/
  return regex.test(phone.replace(/\D/g, ''))
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Property details validation
export const isValidPropertyDetails = (property: any): boolean => {
  return (
    property.title &&
    property.title.length >= 5 &&
    property.rentPerMonth >= 5000 &&
    property.rentPerMonth <= 500000 &&
    property.bedrooms >= 0 &&
    property.location.city &&
    property.location.area
  )
}

// OTP validation (6 digits)
export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}
```

### 4.5 Create `src/lib/utils.ts`

```typescript
// Format currency (Indian Rupees)
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`
}

// Format date
export const formatDate = (date: Date | number): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date and time
export const formatDateTime = (date: Date | number): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Truncate text
export const truncate = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Mask phone number
export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '+91****$3')
}

// Generate random ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

---

## 5. Type Definitions (30 mins)

### Create `src/types/index.ts`

```typescript
// User Types
export interface User {
  userId: string
  phone: string
  phoneVerified: boolean
  name: string
  email?: string
  profileImage?: string
  userType: 'tenant' | 'owner' | 'admin'
  status: 'active' | 'suspended' | 'deleted'
  language: 'en' | 'ta'
  totalUnlocks: number
  totalMoneySpent: number
  createdAt: Date
  updatedAt: Date
}

// Property Types
export interface Property {
  propertyId: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  title: string
  description: string
  propertyType: 'apartment' | 'house' | 'villa' | 'plot' | 'studio'
  location: {
    city: string
    area: string
    landmark?: string
    geoPoint?: { latitude: number; longitude: number }
  }
  specifications: {
    bedrooms: number
    bathrooms: number
    builtUpArea: number
  }
  rental: {
    monthlyRent: number
    depositAmount: number
    maintenanceCharges?: number
    availableFrom: Date
  }
  amenities: string[]
  media: {
    images: { url: string; uploadedAt: Date; caption?: string }[]
    videoUrl?: string
    coverImageUrl: string
  }
  status: 'active' | 'inactive' | 'sold' | 'suspended'
  featured: boolean
  analytics: {
    totalViews: number
    saves: number
    unlocks: number
  }
  createdAt: Date
  updatedAt: Date
}

// Payment Types
export interface Payment {
  paymentId: string
  transactionId: string
  userId: string
  propertyId: string
  ownerId: string
  amount: number
  currency: 'INR'
  gateway: 'cashfree' | 'razorpay'
  gatewayOrderId: string
  gatewayPaymentId: string
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  unlockedContact?: {
    ownerName: string
    ownerPhone: string
    ownerEmail?: string
  }
  createdAt: Date
  completedAt?: Date
}

// Unlock Types
export interface Unlock {
  unlockId: string
  userId: string
  propertyId: string
  paymentId: string
  ownerName: string
  ownerPhone: string
  ownerEmail?: string
  unlockedAt: Date
}

// Save Types
export interface Save {
  saveId: string
  userId: string
  propertyId: string
  savedAt: Date
  notes?: string
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}
```

---

## 6. Hook Examples (30 mins)

### Create `src/hooks/useAuth.ts`

```typescript
import { useState, useCallback, useEffect } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { User } from '@types/index'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          setUser(userDoc.data() as User)
          setFirebaseUser(firebaseUser)
        } else {
          setUser(null)
          setFirebaseUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  return { user, firebaseUser, loading, error }
}
```

### Create `src/hooks/usePayment.ts`

```typescript
import { useState } from 'react'
import { createPaymentOrder, verifyPayment } from '@lib/payments'
import { ApiResponse, Payment } from '@types/index'

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = async (
    amount: number,
    propertyId: string,
    userId: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await createPaymentOrder({
        amount,
        propertyId,
        userId
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Payment initiation failed')
      }

      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyPaymentStatus = async (
    orderId: string,
    paymentId?: string
  ): Promise<ApiResponse<Payment>> => {
    setLoading(true)
    setError(null)

    try {
      const response = await verifyPayment({ orderId, paymentId })
      if (!response.success) {
        throw new Error(response.error?.message || 'Payment verification failed')
      }
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    initiatePayment,
    verifyPaymentStatus,
    loading,
    error
  }
}
```

---

## 7. Base Components (1.5 hours)

### Create `src/components/Common/Button.tsx`

```typescript
import React from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  href?: string
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border-2 border-primary text-primary hover:bg-primary/10',
  tertiary: 'text-primary hover:bg-primary/5'
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]'
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  href,
  children,
  onClick,
  className = ''
}: ButtonProps) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-md font-semibold transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  const content = (
    <>
      {loading && <span className="animate-spin">⏳</span>}
      {icon && !loading && icon}
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    )
  }

  return (
    <button
      className={baseStyles}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  )
}
```

### Create `src/components/Common/Card.tsx`

```typescript
import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hoverable?: boolean
}

export const Card = ({
  className = '',
  children,
  onClick,
  hoverable = false
}: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${hoverable ? 'hover:shadow-md hover:scale-105 cursor-pointer transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
```

### Create `src/components/Common/LoadingSpinner.tsx`

```typescript
import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-primary-light border-t-primary rounded-full animate-spin`} />
      {text && <p className="text-text-secondary">{text}</p>}
    </div>
  )
}
```

---

## 8. Root Layout (20 mins)

### Create `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'Vaadagaiku - Rental Marketplace',
  description: 'Find your perfect rental property in Thanjavur and beyond',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### Create `src/app/page.tsx`

```typescript
'use client'

import { useAuth } from '@hooks/useAuth'
import { LoadingSpinner } from '@components/Common/LoadingSpinner'
import { Button } from '@components/Common/Button'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Loading..." />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-text-primary">Vaadagaiku</h1>
        <p className="text-text-secondary text-center">Find your perfect rental</p>
        <Button href="/auth" size="lg">
          Get Started
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
      {user.userType === 'tenant' ? (
        <Button href="/property">Browse Properties</Button>
      ) : (
        <Button href="/owner/dashboard">Go to Dashboard</Button>
      )}
    </div>
  )
}
```

---

## 9. Git Setup (10 mins)

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.next/
.env.local
.env.*.local
dist/
build/
.DS_Store
*.log
.vercel
.idea/
.vscode/
*.swp
EOF

# Initial commit
git add .
git commit -m "feat: initial project setup with Next.js, Firebase, and design system"

# Add remote (optional)
# git remote add origin https://github.com/username/vaadagaiku.git
# git branch -M main
# git push -u origin main
```

---

## 10. Verification Checklist

Run through these checks to verify setup:

```bash
# ✓ Run linter
npm run lint

# ✓ Build check
npm run build

# ✓ Start dev server
npm run dev
# Visit http://localhost:3000

# ✓ Check folder structure
tree -L 2 src/

# ✓ Verify environment variables
cat .env.local

# ✓ Git status
git status
```

---

## 11. Next Steps (Phase 1 Week 1)

After setup completes, move to:

1. **Authentication Routes**
   - Implement `/auth/page.tsx` (OTP login)
   - Create `/api/auth/send-otp`
   - Create `/api/auth/verify-otp`

2. **Property Listing**
   - Create `/property/page.tsx` (main listing)
   - Implement property card component
   - Add filters and search

3. **Payment Integration** (Week 2)
   - Implement PaymentModal component
   - Create `/api/cashfree/create-order`
   - Set up webhook handling

---

## 12. IDE Setup (Recommended Extensions)

For VS Code:

```
ES7+ React/Redux/React-Native snippets
Prettier - Code formatter
ESLint
Tailwind CSS IntelliSense
Firebase Explorer
Thunder Client (API testing)
Git Graph
```

---

## 13. Database Initial Setup (Firebase Console)

**Required Collections:**
- [ ] `users`
- [ ] `properties`
- [ ] `payments`
- [ ] `unlocks`
- [ ] `saves`

**Security Rules:**
Copy from BACKEND_SCHEMA.md → Firestore Rules

**Indexes:**
Create composite indexes as needed (Firestore will prompt)

---

**Estimated Setup Time: 4-5 hours**  
**Status: Ready for Phase 1 Week 1 Development** ✅

