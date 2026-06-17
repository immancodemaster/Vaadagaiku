# Technical Requirements Document (TRD)
## Vaadagaiku - Rental Marketplace Platform

**Document Version:** 1.0  
**Date:** 2026-06-17  
**Owner:** Deepak (deepak@pashtek.com)  
**Status:** Active Development

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend Layer                      │
├─────────────────────────────────────────────────────────┤
│  Next.js 14 (Web)  │  React Native / Android Native    │
│  TypeScript        │  Kotlin / Java                     │
│  TailwindCSS       │  Material Design / Custom UI       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────┴──────────────────────────────────┐
│                   API Layer (Next.js)                   │
├──────────────────────────────────────────────────────────┤
│ Route Handlers                                          │
│ ├── /api/auth/*                                         │
│ ├── /api/properties/*                                   │
│ ├── /api/payments/*                                     │
│ ├── /api/users/*                                        │
│ └── /api/webhooks/*                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐ ┌──────▼──────┐ ┌────▼─────────┐
│  Firebase  │ │  Cashfree  │ │  Cloud CDN  │
│   (Auth,   │ │  (Payments)│ │  (Images)   │
│  Firestore)│ │ Razorpay   │ │             │
└────────────┘ └────────────┘ └─────────────┘
```

---

## 2. Technology Stack

### Frontend
| Component | Technology | Version | Reason |
|-----------|-----------|---------|--------|
| **Framework** | Next.js | 14+ | SSR, API routes, fast refresh |
| **Language** | TypeScript | 5+ | Type safety, better DX |
| **Styling** | TailwindCSS | 3+ | Rapid UI development |
| **State Management** | React Context | - | Lightweight for marketplace |
| **HTTP Client** | Axios | 1.6+ | Interceptors, request cancellation |
| **Form Handling** | React Hook Form | 7+ | Lightweight, fast |

### Backend
| Component | Technology | Version | Reason |
|-----------|-----------|---------|--------|
| **Runtime** | Node.js | 18+ | Proven, scalable |
| **Framework** | Next.js API Routes | 14+ | Monolithic, serverless-ready |
| **Database** | Firebase Firestore | - | Real-time, scalable, no ops |
| **Storage** | Firebase Storage | - | Managed image/video storage |
| **Auth** | Firebase Auth | - | Phone OTP out of box |
| **Hosting** | Vercel | - | Serverless, auto-scaling |

### Payment & External Services
| Service | Provider | Status |
|---------|----------|--------|
| **Payment Gateway** | Cashfree | Primary |
| **Payment Fallback** | Razorpay | Backup |
| **SMS (Notifications)** | Firebase (optional) / Twilio | Future |
| **Email** | SendGrid / Nodemailer | Future |
| **Analytics** | Firebase Analytics / Mixpanel | Future |

### Mobile (Planned)
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React Native / Kotlin | - |
| **UI Library** | React Native Paper / Material Design | - |
| **HTTP Client** | Axios | 1.6+ |
| **State** | Redux / Context | - |
| **Local Storage** | AsyncStorage / SharedPreferences | - |

---

## 3. Database Schema (Firebase Firestore)

### Collections & Documents

#### **3.1 `users` Collection**
```javascript
{
  userId: string (doc ID = Firebase UID),
  
  // Profile
  phone: string (unique, indexed),
  phoneVerified: boolean,
  name: string,
  email: string (optional),
  profileImage: string (URL),
  
  // Account Type
  userType: enum["tenant", "owner", "admin"],
  
  // Account Status
  status: enum["active", "suspended", "deleted"],
  createdAt: timestamp,
  lastLoginAt: timestamp,
  
  // Settings
  language: enum["en", "ta"],
  notifications: {
    email: boolean,
    sms: boolean,
    push: boolean
  },
  
  // Analytics
  totalUnlocks: number,
  totalMoneySpent: number,
  totalPropertiesListed: number,
  
  // Metadata
  deviceInfo: string (user agent),
  lastIPAddress: string,
  referralCode: string (optional)
}
```

#### **3.2 `properties` Collection**
```javascript
{
  propertyId: string (doc ID = unique),
  
  // Owner Info
  ownerId: string (references users),
  ownerName: string,
  ownerPhone: string,
  
  // Basic Info
  title: string,
  description: string,
  propertyType: enum["apartment", "house", "villa", "plot"],
  
  // Location
  city: string (indexed),
  area: string (indexed),
  landmark: string,
  latitude: number,
  longitude: number,
  address: string,
  
  // Details
  bedrooms: number (indexed),
  bathrooms: number,
  squareFeet: number,
  floor: string,
  totalFloors: number,
  
  // Rental Info
  rentPerMonth: number (indexed),
  depositAmount: number,
  maintenanceCharges: number,
  availableFrom: date,
  
  // Amenities (array)
  amenities: ["WiFi", "Parking", "AC", "Balcony", "Gym", "Pool"],
  
  // Media
  images: [{ url: string, uploadedAt: timestamp }] (min 3, max 20),
  videoUrl: string (optional),
  
  // Status
  status: enum["active", "inactive", "sold"],
  featured: boolean (for Phase 3),
  viewCount: number,
  
  // Analytics
  unlockCount: number,
  saveCount: number,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  expiresAt: timestamp (30 days from update)
}
```

#### **3.3 `payments` Collection**
```javascript
{
  paymentId: string (doc ID = userId_propertyId_timestamp),
  
  // User & Property
  userId: string (indexed),
  propertyId: string (indexed),
  amount: number,
  
  // Payment Gateway Info
  gateway: enum["cashfree", "razorpay"],
  orderId: string (cashfree: merchantOrderId, razorpay: order_id),
  transactionId: string (cashfree: cfPaymentId, razorpay: payment_id),
  
  // Payment Details
  method: enum["card", "upi", "netbanking", "wallet"],
  cardLast4: string (optional),
  upiId: string (optional),
  
  // Status
  status: enum["pending", "completed", "failed", "refunded"],
  paymentStatus: string (raw gateway status),
  
  // Security
  signatureVerified: boolean,
  signatureVerificationMethod: enum["hmac", "polling", "webhook"],
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp,
  refundedAt: timestamp (optional),
  
  // Contact Info (denormalized)
  unlockedContactInfo: {
    ownerPhone: string,
    ownerName: string,
    ownerEmail: string
  }
}
```

#### **3.4 `unlocks` Collection** (For Quick Lookup)
```javascript
{
  unlockId: string (doc ID = userId_propertyId),
  
  userId: string (indexed),
  propertyId: string (indexed),
  paymentId: string (references payments),
  
  unlockedAt: timestamp,
  expiresAt: timestamp (optional, for time-limited access),
  
  // Contact Info
  ownerPhone: string,
  ownerName: string,
  ownerEmail: string
}
```

#### **3.5 `saves` Collection** (Bookmarks)
```javascript
{
  saveId: string (doc ID = userId_propertyId),
  
  userId: string (indexed),
  propertyId: string (indexed),
  
  savedAt: timestamp,
  notes: string (optional)
}
```

#### **3.6 `transactions` Collection** (Analytics)
```javascript
{
  transactionId: string (doc ID = unique),
  
  type: enum["payment", "refund", "adjustment"],
  userId: string (indexed),
  propertyId: string (indexed),
  paymentId: string (references payments),
  
  amount: number,
  gateway: string,
  status: enum["completed", "failed"],
  
  createdAt: timestamp
}
```

---

## 4. API Specifications

### Base URL
```
Development: http://localhost:3000/api
Production: https://vaadagaiku.vercel.app/api
```

### Authentication
```
Header: Authorization: Bearer {jwtToken}
JWT includes: userId, userType, issuedAt, expiresAt
```

### Response Format
```json
{
  "success": boolean,
  "data": { /* actual data */ },
  "error": { "code": string, "message": string },
  "meta": { "timestamp": string, "requestId": string }
}
```

### 4.1 Authentication Endpoints

#### **POST /auth/send-otp**
Request:
```json
{
  "phone": "+919876543210"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "otpSent": true
  }
}
```

#### **POST /auth/verify-otp**
Request:
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": { /* user object */ },
    "isNewUser": true
  }
}
```

### 4.2 Properties Endpoints

#### **GET /properties?city=Thanjavur&minPrice=5000&maxPrice=50000&bedrooms=2&page=1&limit=20**
Response: Paginated property list

#### **GET /properties/:propertyId**
Response: Single property with full details

#### **POST /properties** (Owner only)
Request: Property creation payload
Response: Created property object

#### **PUT /properties/:propertyId** (Owner only)
Request: Update payload
Response: Updated property object

#### **DELETE /properties/:propertyId** (Owner only)
Response: Success confirmation

### 4.3 Payments Endpoints

#### **POST /cashfree/create-order**
Request:
```json
{
  "amount": 50,
  "propertyId": "string",
  "userId": "string"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "paymentSessionId": "string"
  }
}
```

#### **POST /cashfree/verify**
Request:
```json
{
  "orderId": "string",
  "paymentId": "string"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "transactionId": "string"
  }
}
```

#### **POST /cashfree/webhook** (Webhook)
Request: Cashfree webhook payload
Response: `{ "success": true }`

### 4.4 User Endpoints

#### **GET /users/profile**
Response: Current user profile

#### **PUT /users/profile**
Request: Updated profile data
Response: Updated user object

#### **GET /users/unlocks**
Response: List of properties user has unlocked

#### **GET /users/saves**
Response: List of saved properties

---

## 5. Payment Processing Flow

### Cashfree Payment Flow
```
1. User clicks "Unlock Contact"
   ↓
2. Frontend calls POST /cashfree/create-order
   ├─ Input: amount (50), propertyId, userId
   ├─ Backend validates user, property exists
   └─ Creates Firestore doc: payments/{transactionId}
   ↓
3. Backend calls Cashfree API: POST /orders
   ├─ Sends: amount, customerId, orderId
   └─ Receives: payment_session_id
   ↓
4. Frontend receives: orderId, paymentSessionId
   ↓
5. Cashfree SDK opens payment modal
   ├─ User selects payment method
   ├─ User enters credentials
   └─ Cashfree processes payment
   ↓
6. Two confirmation paths (dual):
   
   Path A - Webhook (Reliable)
   └─ Cashfree → Backend: POST /webhook
      ├─ Verifies HMAC-SHA256 signature
      ├─ Updates Firestore: payments/{id}.status = "completed"
      ├─ Unlocks contact in Firestore: unlocks/{userId}_{propertyId}
      └─ Firebase triggers: email/SMS notification
   
   Path B - Polling (Fallback)
   └─ Frontend polls: GET /verify?orderId=xxx
      ├─ Queries Firestore every 1 second
      ├─ When status changes to "completed"
      └─ Unlocks contact UI immediately
   
   ↓
7. Contact info displayed to user
   └─ ownerName, ownerPhone, ownerEmail
```

### Razorpay Fallback (Legacy)
Same flow, different API endpoints:
- Create order: `https://api.razorpay.com/v1/orders`
- Verify: `POST /razorpay/verify`
- Webhook: `POST /razorpay/webhook`

---

## 6. Security Requirements

### Authentication & Authorization
- [ ] JWT tokens with 1-hour expiry
- [ ] Refresh tokens for auto-renewal
- [ ] Phone OTP verification (Firebase)
- [ ] Role-based access control (RBAC)

### Data Protection
- [ ] HTTPS/TLS 1.2+ for all traffic
- [ ] Firestore security rules (user-specific access)
- [ ] Encrypt sensitive fields (phone, payment data)
- [ ] No passwords stored (phone-only auth)

### Payment Security
- [ ] HMAC-SHA256 signature verification
- [ ] PCI-DSS compliance (delegated to gateway)
- [ ] No credit card data stored
- [ ] Payment method tokens (if applicable)
- [ ] Rate limiting on payment endpoints

### Fraud Prevention
- [ ] User creation rate limiting
- [ ] Duplicate payment detection
- [ ] Suspicious transaction alerts
- [ ] Phone number validation

---

## 7. Scalability & Performance

### Database Optimization
- Firestore indexes on frequently queried fields:
  - `properties: city, bedrooms, rentPerMonth, createdAt`
  - `users: phone, createdAt`
  - `payments: userId, propertyId, status`
- Denormalization of contact info in `payments` collection
- Pagination for list endpoints (default: 20 items)

### API Performance
- API response time target: < 500ms (p95)
- Database query time target: < 200ms
- Image optimization: WebP format, CloudFlare CDN
- Lazy loading for property images

### Caching Strategy
- **Frontend:** React Query (SWR), localStorage for user session
- **Backend:** Cloud CDN for static assets
- **Database:** Firestore native caching
- **Images:** CloudFlare/Firebase Storage CDN

### Load Testing
- Simulate 1,000 concurrent users
- Payment processing: 100 transactions/second capacity
- Monitor: Vercel analytics, Firebase monitoring

---

## 8. Monitoring & Logging

### Metrics to Track
- API response time (p50, p95, p99)
- Error rate by endpoint
- Database query performance
- Payment success rate
- User session duration
- Conversion rate (unlock clicks)

### Logging
- All API requests/responses (anonymized)
- Payment transactions (audit trail)
- User authentication events
- Error stacktraces
- Firebase logs (Cloud Logging)

### Alerting
- Payment success rate < 95% → Alert
- API error rate > 1% → Alert
- Database latency > 1000ms → Alert
- Webhook delivery failure → Alert

---

## 9. Deployment & DevOps

### CI/CD Pipeline
```
git push
  ↓
GitHub Actions:
  ├─ Lint (ESLint)
  ├─ Type check (TypeScript)
  ├─ Unit tests
  └─ Build Next.js
  ↓
Deploy to Vercel (staging)
  ↓
Manual approval
  ↓
Deploy to Production
```

### Environment Management
```
.env.local          → Local development
.env.staging        → Staging environment
.env.production     → Production environment

Secrets (Vercel):
- CASHFREE_KEY_SECRET
- FIREBASE_PRIVATE_KEY
- JWT_SECRET
```

### Backup & Recovery
- Firestore automated backups (30-day retention)
- Nightly exports to Cloud Storage
- Recovery time objective (RTO): 1 hour
- Recovery point objective (RPO): 1 hour

---

## 10. Testing Strategy

### Unit Testing
- API route handlers
- Payment verification logic
- Database queries
- Utility functions
Framework: Jest, React Testing Library

### Integration Testing
- Auth flow (OTP send → verify)
- Property CRUD operations
- Payment flow (Cashfree/Razorpay)
- Webhook processing
Framework: Jest + Supertest

### End-to-End Testing
- User signup → login → browse → unlock → payment
- Property owner → create → list → view inquiries
Framework: Cypress / Playwright

### Load Testing
- 1,000 concurrent users
- 100 payment transactions/second
- Database query performance
Tool: JMeter / k6

---

## 11. Error Handling

### Payment Failures
```
Failure Scenarios:
1. Payment declined → Show error, allow retry
2. Network timeout → Retry automatic, show fallback
3. Invalid amount → Validation on frontend + backend
4. Duplicate payment → Detect & prevent
5. Webhook not received → Polling catchup

User Experience:
- Clear error message
- Refund processing
- Support contact info
```

### API Errors
```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be >= 50",
    "statusCode": 400
  }
}
```

---

## 12. Future Scalability

### Planned Improvements
- **Month 1-2:** Basic payment processing
- **Month 3:** Analytics dashboard
- **Month 4:** SMS/Email notifications
- **Month 5:** Mobile app (React Native)
- **Month 6:** AI recommendations
- **Month 8:** Rent payment integration

### Architectural Readiness
- Current schema supports 1M+ properties
- API designed for 10,000+ requests/minute
- Database queries indexed for performance
- Frontend built for feature flags & A/B testing

---

## 13. Code Structure

```
src/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth/
│   │   ├── properties/
│   │   ├── payments/
│   │   ├── cashfree/
│   │   ├── razorpay/
│   │   └── webhooks/
│   ├── (pages)/                # Next.js pages
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Layout/
│   ├── Payment/
│   ├── Property/
│   ├── Venue/
│   ├── Auth/
│   └── Common/
├── lib/
│   ├── firebase.ts
│   ├── payments.ts
│   ├── auth.ts
│   ├── validation.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePayment.ts
│   └── useProperties.ts
├── styles/
│   └── globals.css
└── __tests__/
    ├── auth.test.ts
    ├── payments.test.ts
    └── properties.test.ts
```

---

## 14. Compliance & Standards

- [ ] GDPR (if EU users)
- [ ] Data Protection Act 2018 (India)
- [ ] RBI payment guidelines
- [ ] PCI-DSS Level 1 (via Cashfree)
- [ ] WCAG 2.1 Level AA (Accessibility)

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-17  
**Next Review:** 2026-07-17
