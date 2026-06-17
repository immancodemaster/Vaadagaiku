# Figma Wireframe & Design Specifications
## Vaadagaiku - Ready-to-Build Guide

**Date:** 2026-06-17  
**Figma Setup Time:** 2-3 hours  
**Components Needed:** 30+

---

## 1. Quick Figma Setup Guide

### Project Structure
```
Vaadagaiku Design System (Main File)
├── 📘 Styles & Tokens
│   ├── Colors (Semantic palette)
│   ├── Typography (Font styles)
│   ├── Spacing (Component sets)
│   └── Shadows & Elevation
│
├── 🧩 Components Library
│   ├── Buttons (Primary, Secondary, Tertiary)
│   ├── Inputs (Text, Select, Date)
│   ├── Cards (Property, User)
│   ├── Modals & Dialogs
│   ├── Chips & Badges
│   ├── Tabs & Bottom Nav
│   └── Headers & Footers
│
├── 📱 Screens - Tenant Flow
│   ├── Auth (OTP screens)
│   ├── Home / Property List
│   ├── Property Detail
│   ├── Payment Modal
│   ├── Saved Properties
│   └── Account / Profile
│
├── 🏠 Screens - Owner Flow
│   ├── Owner Dashboard
│   ├── Create Property (8 steps)
│   ├── Manage Properties
│   ├── View Inquiries
│   └── Analytics
│
└── 📐 Responsive Layouts
    ├── Mobile (375px)
    ├── Tablet (768px)
    └── Desktop (1024px)
```

---

## 2. Color Tokens (In Figma)

### Create Color Styles
```
Primary Colors:
- primary/default → #FF6B35
- primary/light   → #FFE0CC
- primary/dark    → #CC4A1F

Semantic Colors:
- text/primary    → #1A1A1A
- text/secondary  → #4B5563
- text/tertiary   → #9CA3AF

- bg/default      → #FFFFFF
- bg/light        → #F5F5F5

- success         → #22C55E
- error           → #EF4444
- warning         → #F59E0B
- info            → #3B82F6

Neutral:
- border          → #E5E7EB
- disabled        → #D1D5DB
```

---

## 3. Typography Styles (In Figma)

### Font Styles to Create
```
H1 (Page Title)
- Family: Inter / Roboto
- Size: 32px
- Weight: 700 (Bold)
- Line Height: 1.2

H2 (Section Header)
- Family: Inter / Roboto
- Size: 24px
- Weight: 700
- Line Height: 1.3

H3 (Subheading)
- Family: Inter / Roboto
- Size: 20px
- Weight: 600
- Line Height: 1.3

Body (Regular Text)
- Family: Inter / Roboto
- Size: 16px
- Weight: 400
- Line Height: 1.5

Body Small
- Family: Inter / Roboto
- Size: 14px
- Weight: 400
- Line Height: 1.5

Caption
- Family: Inter / Roboto
- Size: 12px
- Weight: 400
- Line Height: 1.4
```

---

## 4. Component Specifications

### 4.1 Button Components

#### Primary Button
```
Name: Button/Primary

States: Default, Hover, Active, Disabled
Padding: 12px 24px (vertical x horizontal)
Border Radius: 8px
Min Height: 48px
Background: #FF6B35
Text Color: #FFFFFF
Font: Body (semibold)

Hover: #E65A25
Active: #CC4A1F
Disabled: #D1D5DB + opacity 50%

Variants:
- Size: Small (36px), Default (48px), Large (56px)
- Width: Hug content, Fixed (200px), Full width
```

#### Secondary Button
```
Name: Button/Secondary

Padding: 12px 24px
Border Radius: 8px
Min Height: 48px
Background: Transparent
Border: 2px solid #FF6B35
Text Color: #FF6B35
Font: Body (semibold)

Hover: Background #FFF3E0
Active: Background #FFE0CC
Disabled: Gray with opacity

Variants: Size, Width (same as Primary)
```

#### Tertiary Button (Text)
```
Name: Button/Tertiary

Padding: 8px 12px
Background: Transparent
Border: None
Text Color: #FF6B35
Font: Body (medium, 500)

Hover: Background #FFF3E0
Active: Color #CC4A1F
Disabled: Color #9CA3AF

Variants: Icon Left/Right
```

---

### 4.2 Input Components

#### Text Input
```
Name: Input/Text

Height: 48px
Padding: 12px 16px
Border: 1px solid #E5E7EB
Border Radius: 8px
Font: Body (16px)
Background: #FFFFFF

States:
- Default: As above
- Focus: Border #FF6B35, Outline #FFE0CC 2px
- Error: Border #EF4444
- Disabled: Background #F5F5F5

Label:
- Position: Above input, 8px gap
- Font: 14px, weight 500
- Color: #1A1A1A

Placeholder:
- Color: #9CA3AF
- Font weight: 400

Error Message:
- Position: Below input, 4px gap
- Font: 12px
- Color: #EF4444
- Icon: ⚠️

Variants:
- Label position (top, left)
- Icon position (left, right)
- State (default, focus, error, disabled)
```

#### Select Input
```
Name: Input/Select

Same as Text Input + dropdown arrow
Icon: Chevron down (24px)
Dropdown menu: Custom scroll, max 300px height

Options:
- Padding: 12px 16px
- Font: Body (14px)
- Hover background: #F5F5F5
- Selected: Background #FFE0CC, text bold
```

#### Date Input
```
Name: Input/Date

Same as Text Input
On focus: Show calendar picker
Format: DD/MM/YYYY
Min date: Today
Max date: 30 days from today
```

---

### 4.3 Card Components

#### Property Card
```
Name: Card/Property

Dimensions: 100% width (mobile), 300px (desktop)
Corner Radius: 12px
Border: 1px solid #E5E7EB
Shadow: Small (0 1px 2px rgba(0,0,0,0.05))
Background: #FFFFFF

Content:
├── Image: 100% width, 200px height, object-fit: cover
├── Title: H3 (20px)
├── Location: Body Small (14px), color: gray
├── Price: H2 (24px), color: #FF6B35
├── Specs: "2 BHK | 800 SF" (Body Small)
├── Amenities: 3 icons max (WiFi, Parking, AC)
└── Actions:
    ├── [Save ❤️] Secondary button
    └── [View Details] Primary button

States:
- Default: As above
- Hover: Shadow medium, scale 1.02
- Active/Pressed: Scale 0.98

Variants:
- Featured badge (gold ribbon)
- Verified badge (checkmark)
```

#### User Card (For Inquiries)
```
Name: Card/User

Padding: 16px
Border Radius: 12px
Border: 1px solid #E5E7EB
Background: #FFFFFF

Content:
├── Avatar: 40px circle
├── Name: Body (semibold)
├── Phone: Body Small (masked: +91*****)
├── Unlocked Date: Caption
└── Actions:
    ├── [Call] Icon button
    ├── [WhatsApp] Icon button
    └── [Email] Icon button

States:
- Default: White background
- Hover: Light gray background
```

---

### 4.4 Modal Components

#### Payment Modal
```
Name: Modal/Payment

Size: 500px max width (mobile: 90vw)
Corner Radius: 16px
Shadow: Large (0 10px 15px -3px rgba(0,0,0,0.1))
Padding: 24px

Structure:
├── Header
│   ├── Title: "Unlock Contact" (H2)
│   └── Close Button: [X] (top right)
├── Divider: 1px #E5E7EB
├── Content
│   ├── Property Name
│   ├── Owner Name
│   ├── Amount: "₹50" (H2, orange)
│   ├── Payment Method Selection
│   │   ├── ◉ UPI (selected)
│   │   ├── ○ Card
│   │   ├── ○ Net Banking
│   │   └── ○ Wallet
│   └── Terms: Checkbox + link
└── Footer
    ├── [Pay ₹50 Securely] (Primary, full width)
    └── [Cancel] (Secondary, full width)

Overlay:
- Background: rgba(0,0,0,0.5)
- Backdrop filter: blur(4px)
- Click outside: Close

Variants:
- Loading state (spinner)
- Success state (checkmark)
- Error state (error message)
```

---

### 4.5 Bottom Navigation

#### Bottom Nav (Mobile)
```
Name: BottomNav

Height: 56px
Background: #FFFFFF
Border Top: 1px solid #E5E7EB
Position: Sticky bottom
Safe area padding: +20px (notch consideration)

Items (5):
1. Home: [🏠] Home
2. Search: [🔍] Browse
3. Saved: [❤️] Saved
4. Chat: [💬] Messages (Phase 3)
5. Account: [👤] Account

States:
- Inactive: Icon #9CA3AF, Label hidden
- Active: Icon #FF6B35, Label visible, indicator line above

Layout:
- Flex: space-around
- Icons: 24px
- Font: 12px (caption)
- Gap: 4px (icon to label)

Variants:
- With notification badge (red dot, "3")
```

---

### 4.6 Tabs

#### Tab Component
```
Name: Tab

Padding: 12px 16px
Font: Body (14px, semibold)
Color (inactive): #4B5563
Color (active): #FF6B35

Border:
- Top border: 3px solid (transparent / #FF6B35)
- Bottom: None

States:
- Inactive: Gray text, transparent border
- Active: Orange text, orange border

Scroll behavior:
- Horizontal scroll on mobile
- Tabs always visible on desktop

Example tabs for Owner Dashboard:
- All Properties
- Active
- Inactive
- Analytics
```

---

## 5. Screen Wireframes (ASCII + Specs)

### Screen 1: Property Listing (Tenant Home)

```
┌──────────────────────────────┐
│ ≡ Thanjavur        🔍 Search │ Header (Sticky)
├──────────────────────────────┤
│ Filters (Horizontal Scroll)  │
│ [Location▼] [Price▼] [Beds▼] │
├──────────────────────────────┤
│ Results: 342 properties      │
│ [Sort: Newest ▼]            │
├──────────────────────────────┤
│ ┌─────────────────────────┐  │
│ │ [Image]                 │  │
│ │ Spacious Apartment      │  │ Property Card
│ │ Nandi Nagar             │  │
│ │ ₹15,000/mo │ 2 │ 800SF  │  │
│ │ 🟡 Featured             │  │
│ │ [❤️ Save] [View Details]│  │
│ └─────────────────────────┘  │
│                              │
│ (Repeat for each property)   │
│                              │
│ [Load More]                  │
├──────────────────────────────┤
│ 🏠 Home | 🔍 Browse | ❤️ Saved
│ 💬 Chat | 👤 Account        │ Bottom Nav
└──────────────────────────────┘

Layout: Mobile (375px)
- 1 column, full width cards
- Padding: 16px
- Gap between cards: 16px
- Image: 100% width, 200px height
```

---

### Screen 2: Property Detail

```
┌──────────────────────────┐
│ [←] Share [❤️]          │ Header
├──────────────────────────┤
│ ┌────────────────────┐   │
│ │ [Main Image]  ◄ ► │   │ Gallery (Swipeable)
│ └────────────────────┘   │
│ ●○○○○ (Indicators)      │
│                          │
│ [Thumb 1] [Thumb 2]...  │
├──────────────────────────┤
│ Spacious Apartment      │ Title (H2)
│ ⭐ 4.5 (12) | 120 views │ Ratings + views
│ ₹15,000/month           │ Price (H2)
│ Security: ₹45,000       │
│ Maintenance: ₹500/month │
├──────────────────────────┤
│ Quick Details:          │
│ 🛏️ 2 Bed | 🚿 1 Bath   │
│ 📏 800 SF | 📍 G Floor  │
│ 📅 Available: Jun 15    │
├──────────────────────────┤
│ Amenities:              │
│ ✓ WiFi ✓ Parking ✓ AC   │
│ ✓ Balcony ✓ Guard       │
├──────────────────────────┤
│ About This Property     │
│ [Description text...]   │
├──────────────────────────┤
│ [Unlock Contact ₹50]    │ Primary button, full width
│ [Schedule Tour]         │ Secondary button
│ [Save]                  │ Tertiary button
├──────────────────────────┤
│ 🏠 Home | 🔍 Browse...  │ Bottom Nav
└──────────────────────────┘

Layout:
- Full screen
- Sticky header with back + share
- Image gallery 100% width
- Content scrollable below
- CTA buttons fixed at bottom (safe area)
```

---

### Screen 3: Payment Modal

```
┌─────────────────────────┐
│ Unlock Contact  [X]     │ Modal header
├─────────────────────────┤
│                         │
│ Property:               │
│ Spacious Apartment      │
│                         │
│ Owner: John Doe         │
│                         │
│ Amount: ₹50             │ H2, orange
│                         │
├─────────────────────────┤
│ Payment Method:         │
│                         │
│ ◉ UPI                   │ Selected
│ ○ Card                  │
│ ○ Net Banking           │
│ ○ Wallet                │
│                         │
│ ☐ I agree to terms      │
│   [Privacy Policy]      │
│                         │
├─────────────────────────┤
│ [Pay ₹50 Securely]      │ Primary (full width)
│ [Cancel]                │ Secondary (full width)
│                         │
│ 🔒 Secure by Cashfree   │
│                         │
└─────────────────────────┘

Dimensions: 90vw max-width (mobile)
Padding: 24px
Corner radius: 16px
Backdrop: Dark with blur
Animation: Slide up from bottom
```

---

### Screen 4: Owner Dashboard

```
┌──────────────────────────┐
│ ≡ Dashboard            👤 │ Header
├──────────────────────────┤
│ My Properties (5)        │
│ [+ Add Property]         │ Primary button
├──────────────────────────┤
│ Performance             │
│ 📊 Views: 342           │ +15% vs last month
│ 🔓 Unlocks: 28          │ +8% vs last month
│ 💰 Revenue: ₹1,400      │
├──────────────────────────┤
│ My Properties:           │ Tab: All | Active | Inactive
│ [All] [Active] [Inactive]│
├──────────────────────────┤
│ ┌─────────────────────┐  │
│ │ Spacious Apt        │  │ Property item
│ │ ₹15,000 | 2 BHK     │  │
│ │ ✓ Active | 45 views │  │
│ │                     │  │
│ │ [Edit] [Inquiries]  │  │
│ │ [More ⋯]            │  │
│ └─────────────────────┘  │
│                          │
│ (Repeat for each)        │
├──────────────────────────┤
│ 🏠 Home | 🔍 Browse | ...│ Bottom Nav
└──────────────────────────┘

Layout:
- Header: Owner name + logout
- Section 1: CTA to add property
- Section 2: Overview stats (3 metrics)
- Section 3: Property list with actions
- Bottom nav: Hide "Browse" for owners
```

---

### Screen 5: Account / Profile

```
┌──────────────────────────┐
│ My Account              │ Header
├──────────────────────────┤
│ [👤 Circle Image]       │
│ John Doe                │
│ +919876543210           │
│ john@email.com          │
│                         │
│ [Edit Profile]          │ Secondary button
├──────────────────────────┤
│ Account Info            │
│ Joined: Jun 1, 2026     │
│ Total Unlocks: 12       │
│ Total Spent: ₹600       │
├──────────────────────────┤
│ [Payment History]       │ List item (clickable)
│ [Saved Searches]        │
│ [Settings]              │
│ [Help & Support]        │
│ [Privacy Policy]        │
│ [Terms of Service]      │
├──────────────────────────┤
│ [Logout]                │ Danger button (red text)
├──────────────────────────┤
│ 🏠 Home | 🔍 Browse | ...│ Bottom Nav
└──────────────────────────┘

Layout:
- Profile section (top, 120px)
- Info grid or list
- List items: 56px height, clickable
- Danger action at bottom
```

---

## 6. Component Inventory (For Figma Library)

### Buttons (6 variants)
- [ ] Button/Primary
- [ ] Button/Secondary
- [ ] Button/Tertiary
- [ ] Button/Icon
- [ ] Button/Floating Action (FAB)
- [ ] Button/Link

### Inputs (8 variants)
- [ ] Input/Text
- [ ] Input/Search
- [ ] Input/Select
- [ ] Input/Date
- [ ] Input/Phone
- [ ] Checkbox
- [ ] Radio
- [ ] Toggle

### Cards (6 variants)
- [ ] Card/Property
- [ ] Card/User
- [ ] Card/Transaction
- [ ] Card/Metric
- [ ] Card/Empty State
- [ ] Card/Error State

### Navigation
- [ ] Header/Default
- [ ] Header/Sticky
- [ ] BottomNav/Mobile
- [ ] Tab/Default
- [ ] Breadcrumb

### Feedback
- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Alert/Banner
- [ ] Loading/Spinner
- [ ] Loading/Skeleton

### Chips & Badges
- [ ] Chip/Filter
- [ ] Badge/Status
- [ ] Badge/Count
- [ ] Tag/Amenity

---

## 7. Design Handoff Checklist

Before handing off to developers:

- [ ] All colors defined as Figma styles
- [ ] All typography defined as text styles
- [ ] All components built as main components
- [ ] Responsive variants created (mobile, tablet, desktop)
- [ ] Component documentation written (specs visible in Figma)
- [ ] Auto layout applied to components
- [ ] Margins & padding consistent
- [ ] States documented (hover, active, disabled)
- [ ] Accessibility annotations added (alt text, labels)
- [ ] Figma links ready for developers
- [ ] Design specs exported as PDF
- [ ] Design tokens exported (JSON for frontend)

---

## 8. Figma Build Estimate

```
⏱️ Time Breakdown:

Setup (Colors, Typography, Spacing):  1 hour
Components Library (20+ components):  4 hours
Screens (6 main screens):             3 hours
Responsive variants:                  2 hours
Documentation & handoff:              1 hour

TOTAL: ~11 hours (can be done in 2-3 days)

Recommended approach:
Day 1: Setup + Core components (buttons, inputs, cards)
Day 2: Complex components (modals, lists) + Screens
Day 3: Responsive variants + Documentation
```

---

**Next:** Share this guide with your designer or build directly in Figma using these specs! 🎨

