# Product Requirements Document (PRD)
## Vaadagaiku - Rental Marketplace Platform

**Document Version:** 1.0  
**Date:** 2026-06-17  
**Owner:** Deepak (deepak@pashtek.com)  
**Status:** Active Development

---

## 1. Executive Summary

**Vaadagaiku** (வாடகைக்கு) is a mobile-first rental marketplace connecting property owners (lenders) with tenants seeking rental accommodations. The platform operates on a freemium model with multiple monetization tiers, focusing on tier-2/3 cities in India where traditional rental platforms are underserved.

**Mission:** Simplify rental property discovery while enabling owners to connect with serious tenants.

**Vision:** Become the primary rental marketplace across Indian tier-2/3 cities.

---

## 2. Problem Statement

### Pain Points
- **For Tenants:** No centralized platform to browse rental properties with contact verification
- **For Property Owners:** Multiple tenant inquiries with no way to filter serious leads
- **Market Gap:** Limited rental platforms targeting tier-2/3 cities with UPI/cash payment focus

### Target Market
- **Primary:** Thanjavur & surrounding tier-2/3 cities in India
- **Secondary:** Other Tamil Nadu cities with high rental demand
- **User Demographics:** Age 20-45, income ₹20k-100k/month, mobile-first users

---

## 3. Product Vision

### Key Features (Phased Rollout)

#### **Phase 1: MVP (Live)**
- [ ] Free property listings by owners
- [ ] Property browsing with filters (location, price, type)
- [ ] Property detail views with images/videos
- [ ] User authentication (phone-based)

#### **Phase 2: Monetization (Live)**
- [ ] Contact unlock feature (₹50 per unlock)
- [ ] Payment gateway integration (Razorpay → Cashfree)
- [ ] Payment history & management
- [ ] Contact info display after payment

#### **Phase 3: Premium Listings (Ready)**
- [ ] Featured property listings
- [ ] Property promotion/boosting
- [ ] Priority search ranking
- [ ] Analytics dashboard for owners

#### **Phase 4: Engagement (Planned)**
- [ ] In-app advertisements
- [ ] Sponsored listings
- [ ] Property comparison tools
- [ ] Saved properties/wishlist

#### **Phase 5: Subscription (Future)**
- [ ] ₹99/month unlimited contacts
- [ ] Property alerts (SMS/push)
- [ ] Tenant background verification
- [ ] Property inspection booking

---

## 4. Business Model

### Revenue Streams

| Phase | Model | Revenue per Transaction | Status |
|-------|-------|------------------------|----|
| **Phase 1** | Free listings | ₹0 | ✅ Live |
| **Phase 2** | Micro-transactions (₹50/unlock) | ₹49 (after 2% commission) | ✅ Live |
| **Phase 3** | Featured listings (₹500-2000) | ₹490-1960 (2% fee) | 🟡 Ready |
| **Phase 4** | In-app ads (CPM model) | ₹0.50-2 per 1000 impressions | 📋 Planned |
| **Phase 5** | Subscription (₹99/month) | ₹98 (1% payment fee) | 📋 Future |

### Financial Projections

**Month 1-2:** 100-500 DAU, ₹2,500-5,000/month revenue  
**Month 3-4:** 500-1,000 DAU, ₹10,000-25,000/month revenue  
**Month 5-6:** 1,000-5,000 DAU, ₹50,000+/month revenue

---

## 5. User Stories

### Tenant User Journey

**Story 1: Browse & Unlock Contact**
```
As a tenant seeking rental accommodation,
I want to browse available properties by location and price,
So that I can identify suitable options and contact the owner.

Acceptance Criteria:
- Can filter by location, price range, property type
- Can view property details with images
- Can unlock contact info by paying ₹50
- Receives confirmation of successful payment
```

**Story 2: Save Favorite Properties**
```
As a tenant looking for multiple options,
I want to save properties for future reference,
So that I don't have to search again.

Acceptance Criteria:
- Can add properties to "Saved" list
- Can view saved properties at any time
- Can remove from saved list
```

### Owner User Journey

**Story 3: List Property**
```
As a property owner,
I want to list my rental property with details,
So that I can reach potential tenants.

Acceptance Criteria:
- Can add property details (location, price, amenities)
- Can upload multiple photos/videos
- Can set availability dates
- Listing is visible to all users
```

**Story 4: View Tenant Inquiries**
```
As a property owner,
I want to see which tenants are interested in my property,
So that I can contact serious leads.

Acceptance Criteria:
- Can see list of tenants who unlocked my property contact
- Can view tenant profile (optional)
- Can directly contact interested tenants
```

---

## 6. Feature Specifications

### 6.1 Property Listing Features

**Required Information:**
- Property type (apartment, house, villa, plot)
- Location (city, area, street address)
- Monthly rent (₹)
- Bed/Bath count
- Area (sq ft)
- Amenities (WiFi, parking, AC, etc.)
- Availability date
- Owner contact info
- Property images (min 3, max 20)
- Video walkthrough (optional)
- Description/notes

**Validation Rules:**
- Rent range: ₹5,000 - ₹500,000
- Area: 100 - 10,000 sq ft
- Photos: JPG/PNG, max 5MB each
- Video: MP4, max 100MB

### 6.2 Search & Filter

**Search Parameters:**
- Location (city, area)
- Price range (min-max)
- Property type (multi-select)
- Bedrooms (1, 2, 3, 4+)
- Amenities (multi-select)
- Available from (date picker)

**Sorting Options:**
- Price (low to high, high to low)
- Newest first
- Most viewed
- Distance from current location (if enabled)

### 6.3 Payment Features

**Payment Methods:**
- Card (Visa, Mastercard)
- UPI (Google Pay, PhonePe, PayTM, etc.)
- Netbanking (all major banks)
- Mobile wallets

**Transaction Tracking:**
- Payment receipt
- Transaction ID
- Timestamp
- Gateway used
- Amount paid

**Refund Policy:**
- Within 24 hours: Full refund
- 24-72 hours: 50% refund
- After 72 hours: No refund

---

## 7. Non-Functional Requirements

### Performance
- **Page Load Time:** < 2 seconds
- **API Response Time:** < 500ms
- **Concurrent Users:** Support 1,000+ simultaneous users

### Security
- SSL/TLS encryption for all transactions
- PCI-DSS compliance (payment processing)
- HTTPS only
- HMAC-SHA256 signature verification
- No sensitive data in logs

### Scalability
- Database auto-scaling
- CDN for image delivery
- API rate limiting (1,000 requests/minute)
- Queue system for async operations

### Accessibility
- Mobile-first responsive design
- WCAG 2.1 AA compliance (text contrast, keyboard navigation)
- Screen reader support
- Multi-language support (Tamil, English)

---

## 8. Success Metrics

### User Metrics
- [ ] Downloads (Android app)
- [ ] Daily Active Users (DAU)
- [ ] Monthly Active Users (MAU)
- [ ] User retention rate (7-day, 30-day)
- [ ] Churn rate

### Engagement Metrics
- [ ] Listings browsed per session
- [ ] Properties saved per user
- [ ] Contact unlock rate (conversion)
- [ ] Time spent in app
- [ ] Return visit frequency

### Business Metrics
- [ ] Monthly revenue
- [ ] Payment success rate (target: >95%)
- [ ] Average revenue per user (ARPU)
- [ ] Lifetime value (LTV)
- [ ] Cost per acquisition (CPA)

### Quality Metrics
- [ ] Payment failure rate (target: <5%)
- [ ] Support ticket response time (target: <24 hours)
- [ ] App crash rate (target: <0.1%)
- [ ] User satisfaction rating (target: >4.5/5)

---

## 9. Constraints & Assumptions

### Constraints
- **Budget:** Limited initial marketing spend
- **Team Size:** 1-2 developers
- **Payment Gateways:** Cashfree primary, Razorpay fallback
- **Geographic Scope:** India only (initially)
- **Language:** Tamil & English (Phase 1)

### Assumptions
- Users have smartphone (Android/iOS)
- Users comfortable with UPI/digital payments
- Property owners motivated by free exposure + commission
- Tier-2/3 city residents have similar rental preferences
- Payment gateway compliance requirements understood

---

## 10. Risk Mitigation

### Risk 1: Low Initial User Adoption
**Mitigation:** Bootstrap with free listings, organic marketing, local partnerships

### Risk 2: Payment Gateway Issues
**Mitigation:** Dual gateway integration (Cashfree + Razorpay), instant fallback

### Risk 3: Play Store Rejection
**Mitigation:** Submit without payment feature initially, add via app update

### Risk 4: Churn After Subscription Introduction
**Mitigation:** A/B test model before full rollout, add retention mechanics (free daily unlock, referrals)

---

## 11. Rollout Strategy

### Week 1-2: Testing & Deployment
- [ ] Deploy Cashfree integration to production
- [ ] Complete KYC with Cashfree
- [ ] Sandbox testing

### Week 3-4: Android App Launch
- [ ] Submit to Google Play Store (free version, no payment)
- [ ] Target 100+ downloads
- [ ] Gather user feedback

### Week 5-8: Growth Phase
- [ ] Promote app in Thanjavur & surrounding areas
- [ ] Build user base to 1,000+ DAU
- [ ] Monitor conversion metrics
- [ ] Optimize search/filters based on usage

### Month 3: Payment Feature Activation
- [ ] Submit payment feature via app update
- [ ] A/B test with subset of users
- [ ] Measure conversion, churn, LTV

### Month 4+: Scale & Monetize
- [ ] Expand to other tier-2/3 cities
- [ ] Launch featured listings feature
- [ ] Introduce subscription model
- [ ] Build analytics dashboard for owners

---

## 12. Go-to-Market Strategy

### Launch Channels
1. **Direct:** Thanjavur properties + known owners
2. **Organic:** Social media (Instagram, Facebook, WhatsApp)
3. **Partnerships:** Local real estate agents, brokers
4. **Paid:** Targeted Google/Facebook ads (Phase 2)
5. **Referral:** Incentivize user referrals

### Marketing Messages
- **For Owners:** "Free exposure for your rental property"
- **For Tenants:** "Find your perfect rental in seconds"
- **Value Prop:** "Verified renters + Easy payments"

---

## 13. Future Roadmap (3-6 Months)

- [ ] Tenant background verification
- [ ] Property inspection booking
- [ ] AI-powered rental recommendations
- [ ] SMS/push notifications
- [ ] Video call integration
- [ ] Tenant reviews/ratings
- [ ] Rent payment collection system
- [ ] Property management tools for owners
- [ ] Expansion to other cities

---

## 14. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | - | - | - |
| Development Lead | - | - | - |
| Business Owner | Deepak | - | 2026-06-17 |

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-17  
**Next Review:** 2026-07-17
