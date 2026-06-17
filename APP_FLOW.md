# App Flow & User Journeys
## Vaadagaiku - Rental Marketplace Platform

**Document Version:** 1.0  
**Date:** 2026-06-17  
**Owner:** Deepak (deepak@pashtek.com)

---

## 1. Tenant User Journey

### 1.1 First-Time User Flow

```
┌─────────────────┐
│  App Installed  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Splash Screen                   │
│ (Auto-skip if already logged in)│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Auth Page                       │
│ Enter Phone Number              │
│ (+91 XXXXXXXXXX)                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Send OTP                        │
│ "OTP sent to +91..."            │
│ [Change Phone] [Resend OTP (60s)]│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Enter OTP                       │
│ (6-digit code)                  │
│ Auto-verify after 6 digits      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Create Profile (If New User)    │
│ Name (required)                 │
│ Email (optional)                │
│ User Type: Tenant / Owner       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Home Page - Property Listing    │
│ (Logged in as Tenant)           │
└─────────────────────────────────┘
```

### 1.2 Main Tenant Workflow

```
┌─────────────────────────┐
│ Home / Property List    │
│                         │
│ Filters:                │
│ - Location              │
│ - Price Range           │
│ - Bedrooms              │
│ - Amenities             │
└────────┬────────────────┘
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
    ┌────────────┐        ┌──────────────┐
    │ View Card  │        │ Save Property│
    │ (Preview)  │        │ (Bookmark)   │
    └─────┬──────┘        └──────────────┘
         │                         │
         ▼                         ▼
    ┌──────────────────┐  ┌────────────────┐
    │ Property Detail  │  │ Saved Properties│
    │ - Full photos    │  │ - List saved    │
    │ - Amenities      │  │ - Remove saved  │
    │ - Owner details* │  │ - Browse saved  │
    │ (* Locked)       │  └────────────────┘
    └─────┬────────────┘
         │
         ▼
    ┌──────────────────────┐
    │ "Unlock Contact" btn │
    │ Cost: ₹50            │
    │ [Pay]  [Go Back]     │
    └─────┬────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │ Payment Modal        │
    │ Amount: ₹50          │
    │ Method: [List]       │
    │ [Pay Securely]       │
    └─────┬────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │ Processing Payment   │
    │ ...                  │
    └─────┬────────────────┘
         │
     ┌───┴───────┐
     │           │
  Success      Failure
     │           │
     ▼           ▼
  ┌────┐     ┌──────────┐
  │Show│     │Error Msg │
  │Contact │     │Retry   │
  │Info   │     └──────────┘
  │- Name │
  │- Phone│
  │- Email│
  │[Copy] │
  │[Call] │
  │[Message]
  └────┘
```

### 1.3 Search & Browse Flow

```
┌─────────────────────────┐
│ Home Page               │
│ Default: All Properties │
│ City: Thanjavur         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Filter Options                      │
│ [📍 Location]                       │
│ [💰 Price Range]                    │
│ [🛏️ Bedrooms]                      │
│ [🏘️ Amenities]                      │
│ [📅 Available From]                 │
│ [🔽 Sort: Newest/Price/Distance]   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Apply Filters           │
│ Results: 234 found      │
│ [Clear Filters] [Save]  │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│ Filtered Results     │
│ (Paginated, 20/page) │
│ [Previous] [1 2 3...] [Next]
└──────────────────────┘
```

### 1.4 Saved Properties Flow

```
┌──────────────────┐
│ Bottom Tab: ❤️   │
│ Saved            │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│ My Saved Properties        │
│ (Total: 12)                │
│                            │
│ [X] Property 1 - ₹15000    │
│ [X] Property 2 - ₹20000    │
│ [X] Property 3 - ₹25000    │
│                            │
│ Note: Saved for 30 days    │
└────────────────────────────┘
```

### 1.5 Profile & Account Flow

```
┌─────────────────┐
│ Bottom Tab: 👤  │
│ Account         │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ My Account               │
│                          │
│ Name: John Doe          │
│ Phone: +919876543210    │
│ Email: john@email.com   │
│                          │
│ [Edit Profile]           │
│ [Payment History]        │
│ [Saved Searches]         │
│ [Settings]               │
│ [Help & Support]         │
│ [Logout]                 │
└──────────────────────────┘
```

---

## 2. Property Owner Journey

### 2.1 First-Time Owner Setup

```
┌──────────────────────┐
│ App Launch           │
│ Auth (Phone + OTP)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Create Profile               │
│ Name: [______]              │
│ User Type: [👤 Tenant / 🏠 Owner]
│ [Next]                       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────┐
│ Owner Dashboard      │
│ (Empty State)        │
│                      │
│ [+ Add Property]     │
│ [View My Properties] │
│ [View Inquiries]     │
│ [Analytics]          │
└──────────────────────┘
```

### 2.2 Create Property Flow

```
┌──────────────────┐
│ [+ Add Property] │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 1: Basic Info                 │
│                                    │
│ Property Type: [Apartment ▼]       │
│ Title: [_______________________]  │
│ Description: [________________]    │
│ [Next] [Cancel]                    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 2: Location                   │
│                                    │
│ City: [Thanjavur ▼]               │
│ Area: [_______________________]    │
│ Landmark: [_______________________]│
│ Address: [_______________________] │
│ [📍 Get Current Location]          │
│ [Next] [Back]                      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 3: Property Details           │
│                                    │
│ Bedrooms: [2 ▼]                   │
│ Bathrooms: [1 ▼]                  │
│ Sq Ft: [800_______]               │
│ Floor: [Ground Floor ▼]           │
│ Total Floors: [3 ▼]               │
│ [Next] [Back]                      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 4: Rental & Costs             │
│                                    │
│ Monthly Rent: [₹15000_______]      │
│ Deposit: [₹45000_______]           │
│ Maintenance: [₹500_______]         │
│ Available From: [15 Jun 2026]      │
│ [Next] [Back]                      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 5: Amenities                  │
│                                    │
│ ☐ WiFi                            │
│ ☑ Parking                         │
│ ☑ AC                              │
│ ☐ Balcony                         │
│ ☐ Gym                             │
│ ☐ Pool                            │
│ ☐ Security Guard                  │
│ [Next] [Back]                      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 6: Upload Photos              │
│                                    │
│ [📷 Upload Photos] (Min: 3, Max: 20)
│                                    │
│ [1] Living Room.jpg ✓              │
│ [2] Bedroom.jpg ✓                  │
│ [3] Bathroom.jpg ✓                 │
│ [+ Add More]                       │
│ [Next] [Back]                      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 7: Video (Optional)           │
│                                    │
│ [🎥 Upload Walkthrough Video]     │
│ (MP4, Max 100MB)                   │
│ [Skip] [Next] [Back]               │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Step 8: Review & Publish           │
│                                    │
│ Property Name: Spacious Apartment  │
│ Location: Thanjavur, Nandi Nagar   │
│ Rent: ₹15,000 / Month              │
│ Bedrooms: 2 | Area: 800 Sq Ft     │
│ [Edit] [Cancel] [Publish]          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Success! Property Published        │
│ Your property is now visible to    │
│ tenants searching in Thanjavur     │
│ [Go to Property] [Back Home]       │
└────────────────────────────────────┘
```

### 2.3 Manage Properties Flow

```
┌─────────────────────┐
│ Owner Dashboard     │
│ My Properties (5)   │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Property List                    │
│                                  │
│ 1. Spacious Apartment            │
│    ₹15,000/mo | 2 BHK            │
│    ✓ Active | 📊 45 views        │
│    [Edit] [View Inquiries] [More]│
│                                  │
│ 2. Villa with Garden             │
│    ₹45,000/mo | 3 BHK            │
│    ✓ Active | 📊 120 views       │
│    [Edit] [View Inquiries] [More]│
│                                  │
│ 3. Studio Flat                   │
│    ₹8,000/mo | 1 BHK             │
│    ✗ Inactive | No new inquiries │
│    [Edit] [Reactivate] [Delete]  │
└──────────────────────────────────┘
```

### 2.4 View Tenant Inquiries Flow

```
┌────────────────────────────┐
│ Property: Spacious Apt     │
│ Inquiries: 8 Tenants       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Tenant Inquiries                   │
│                                    │
│ 1. John Doe                        │
│    Phone: +919876543210            │
│    Unlocked: Jun 10, 2:30 PM       │
│    [Call] [WhatsApp] [Email]       │
│    [Block] [Note]                  │
│                                    │
│ 2. Sarah Smith                     │
│    Phone: +919876543211            │
│    Unlocked: Jun 12, 5:15 PM       │
│    [Call] [WhatsApp] [Email]       │
│    [Block] [Note]                  │
│                                    │
│ [Export CSV] [Mark as Interested]  │
└────────────────────────────────────┘
```

### 2.5 Owner Analytics Flow

```
┌──────────────────────┐
│ Analytics Dashboard  │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Performance Overview (This Month)  │
│                                    │
│ 📊 Total Views: 342                │
│    +15% vs last month              │
│                                    │
│ 🔓 Total Unlocks: 28               │
│    +8% vs last month               │
│                                    │
│ 💰 Estimated Revenue: ₹1,400       │
│    (28 × ₹50)                      │
│                                    │
│ 📈 Properties Active: 5/5          │
│                                    │
│ [View Detailed Stats]              │
└────────────────────────────────────┘
```

---

## 3. Payment Flow (Detailed)

### 3.1 Payment Processing

```
User selects "Unlock Contact" (₹50)
    │
    ├─── Firebase Check ───┐
    │   Valid user? ✓       │
    │   Valid property? ✓   │
    │   Not already paid? ✓ │
    └─────────────────────┘
         │
         ▼
    Payment Modal Opens
    ┌──────────────────────────┐
    │ Unlock Contact Details   │
    │                          │
    │ Property: Apartment      │
    │ Owner: John Doe          │
    │ Amount: ₹50              │
    │                          │
    │ Payment Method:          │
    │ ○ UPI                    │
    │ ○ Card                   │
    │ ○ NetBanking             │
    │ ○ Wallet                 │
    │                          │
    │ [Pay ₹50 Securely]       │
    │ [Cancel]                 │
    └──────────────────────────┘
         │
         ▼
    Cashfree SDK Integration
    ├─ POST /api/cashfree/create-order
    │  ├─ Create Firebase record
    │  └─ Get paymentSessionId
    │
    ├─ Open Cashfree Modal
    │  ├─ User selects method
    │  ├─ User completes payment
    │  └─ Cashfree processes
    │
    └─ Return to App
         │
    ┌────┴─────────────┐
    │                  │
    Success          Failure
    │                  │
    ▼                  ▼
Dual Confirmation  Error Message
├─ Path A:        "Payment Failed
│  Webhook:        Try another method
│  /webhook        or Contact Support"
│  (Async)         │
│                  ▼
├─ Path B:        Retry Option
│  Polling:        ├─ Try Again
│  /verify         ├─ Change Method
│  (Every 1s)      └─ Cancel
│
├─ Update Firestore
│  ├─ payments/{id}.status = "completed"
│  ├─ unlocks/{userId}_{propertyId} = created
│  └─ transaction log
│
└─ Success Screen
   ┌──────────────────┐
   │ ✓ Payment Success│
   │                  │
   │ Name: John Doe   │
   │ Phone: 98765...  │
   │ Email: john@...  │
   │                  │
   │ [Copy] [Call]    │
   │ [View Details]   │
   │ [Back Home]      │
   └──────────────────┘
```

### 3.2 Payment History

```
┌────────────────────────┐
│ Account > Payment His. │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Payment History (Last 30 Days)    │
│                                    │
│ Jun 15, 2026 | ₹50                │
│ Property: Spacious Apartment       │
│ Status: ✓ Completed                │
│ Owner: John Doe                    │
│ Transaction ID: CF123456           │
│ [View Details] [Download Receipt]  │
│                                    │
│ Jun 12, 2026 | ₹50                │
│ Property: Villa with Garden        │
│ Status: ✓ Completed                │
│ Owner: Sarah Smith                 │
│ [View Details] [Download Receipt]  │
│                                    │
│ Jun 10, 2026 | ₹50                │
│ Property: Studio Flat              │
│ Status: ✗ Failed (Declined)        │
│ [Retry] [View Details]             │
└────────────────────────────────────┘
```

---

## 4. Error & Edge Cases

### 4.1 Error Scenarios

```
User completes payment
but Firestore doesn't update
(Network timeout)

     │
     ▼
Polling every 1 second
     │
     ├─ Success within 5 sec? ✓ Show contact
     │
     └─ No update after 30 sec? 
        ├─ Check payment status (backend)
        ├─ If gateway shows "completed"
        │  └─ Manually unlock in Firestore
        │
        └─ If gateway shows "pending"
           └─ Wait & retry
```

### 4.2 Double-Unlock Prevention

```
User clicks "Unlock" twice quickly
     │
     ├─ Check: Is payment already processed? ✓
     │
     └─ Yes → Show error:
        "You already unlocked this contact"
        [View Details]
```

### 4.3 Network Offline

```
User browsing properties (offline)
     │
     ├─ Cached property list shown
     │
     └─ Click "Unlock" → "You're offline"
        ├─ Cache payment request
        └─ Retry when online
```

---

## 5. Notification Flows

### 5.1 SMS Notifications (Future)

```
Tenant: Unlocks contact
     │
     ▼
SMS to Tenant:
"You unlocked contact for 'Spacious Apt'
Owner: John Doe | +919876543210
Payment ID: TXN123456"

SMS to Owner:
"Your property 'Spacious Apt' contact 
unlocked by a tenant
View inquiries: [Link]"
```

### 5.2 In-App Notifications

```
┌──────────────────────────────────┐
│ 🔔 Notifications (Bell Icon)     │
│                                  │
│ Jun 15, 2:30 PM                  │
│ "Your property contact unlocked" │
│ [New inquiry for Spacious Apt]   │
│                                  │
│ Jun 12, 5:15 PM                  │
│ "Payment received"               │
│ [₹50 from unlock of Villa]       │
│                                  │
│ Jun 10, 10:00 AM                 │
│ "Property listed successfully"   │
│ [Spacious Apartment is live]     │
└──────────────────────────────────┘
```

---

## 6. Mobile App (Android) Specific Flows

### 6.1 Bottom Navigation

```
┌──────────────────────────────────┐
│ Content Area                     │
├──────────────────────────────────┤
│ [🏠] [🔍] [❤️] [💬] [👤]        │
│ Home Browse Saved Chat Account   │
└──────────────────────────────────┘
```

### 6.2 Android Back Button Behavior

```
Home page + Back Button → Exit app (confirm)
Detail page + Back Button → Back to listing
Modal + Back Button → Close modal
Keyboard visible + Back Button → Hide keyboard
```

### 6.3 Push Notifications

```
User: Receives payment confirmation
     │
     ▼
Push Notification:
"Payment Successful! 
Contact for 'Apt' unlocked. Tap to view."
     │
     └─→ Tap → Open property detail page
         └─→ Show contact info
```

---

## 7. Accessibility Flows

### 7.1 Screen Reader Navigation

```
User using screen reader (TalkBack/VoiceOver)
     │
     ├─ Button text announced clearly
     ├─ Images have alt text
     ├─ Form labels linked to inputs
     └─ Notifications announced
```

### 7.2 Text Size & Contrast

```
Settings > Accessibility
├─ Text Size: Small / Normal / Large / Extra Large
├─ High Contrast Mode: On/Off
└─ Auto-brightness: On/Off
```

---

## 8. State Diagram

```
┌──────────────────┐
│   App Launched   │
└────────┬─────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Logged Out   Logged In
    │          │
    ├─>Auth    ├─> Home Page
    │          │
    │      ┌───┴──────┬────────┬──────┐
    │      │          │        │      │
    │      ▼          ▼        ▼      ▼
    │   Browse   Saved   Payment  Account
    │   Props    Props   History  Profile
    │      │          │        │      │
    │      └─>Detail  │        │      │
    │      │          │        │      │
    │      └─────────>Unlock   │      │
    │         Payment │        │      │
    │                 │        │      │
    │                 └────┬───┴──────┘
    │                      │
    └──────────────────────┘
         Logout
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-17  
**Next Review:** 2026-07-17
