# UI/UX Design Brief
## Vaadagaiku - Rental Marketplace Platform

**Document Version:** 1.0  
**Date:** 2026-06-17  
**Owner:** Deepak (deepak@pashtek.com)  
**Design Lead:** [To be assigned]

---

## 1. Design Philosophy

### Core Principles

**1. Simplicity**
- Minimal cognitive load
- Clear hierarchy
- Reduce decision fatigue
- Easy for first-time users

**2. Trust & Safety**
- Transparent pricing (no hidden fees)
- Clear payment information
- Verified property details
- Privacy-first approach

**3. Mobile-First**
- Designed for small screens
- Touch-friendly (48px min buttons)
- Fast loading times
- Offline-friendly content

**4. Inclusive Design**
- WCAG 2.1 Level AA compliance
- High contrast ratios
- Readable font sizes
- Alt text for images

**5. Performance**
- <2 second page loads
- Smooth animations (60fps)
- No jank on budget devices
- Optimized images

---

## 2. Visual Design System

### 2.1 Color Palette

#### Primary Colors
```
Brand Orange:     #FF6B35
  Usage: CTAs, highlights, key features
  RGB: (255, 107, 53)
  Hex: #FF6B35
  
Neutral Dark:     #1A1A1A
  Usage: Text, headers, backgrounds
  RGB: (26, 26, 26)
  
Neutral Light:    #F5F5F5
  Usage: Backgrounds, cards
  RGB: (245, 245, 245)
```

#### Semantic Colors
```
Success:          #22C55E (Green)
  Usage: Confirmations, completed payments
  
Error:            #EF4444 (Red)
  Usage: Errors, failures, warnings
  
Warning:          #F59E0B (Amber)
  Usage: Pending status, cautions
  
Info:             #3B82F6 (Blue)
  Usage: Information, help, tooltips
```

#### Additional Colors
```
Silver:           #E5E7EB
  Usage: Borders, dividers, disabled states
  
Gold:             #FBBF24
  Usage: Premium features, ratings
  
Gray 600:         #4B5563
  Usage: Secondary text, hints
```

### 2.2 Typography

#### Font Family
```
Primary: Inter or Roboto (sans-serif)
- Clean, modern, highly readable
- Works well at small sizes
- Excellent on mobile devices

Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

#### Font Sizes & Weights

```
Headline 1 (H1)
- Size: 32px / 2rem
- Weight: Bold (700)
- Line Height: 1.2
- Usage: Page titles

Headline 2 (H2)
- Size: 24px / 1.5rem
- Weight: Bold (700)
- Line Height: 1.3
- Usage: Section headers

Headline 3 (H3)
- Size: 20px / 1.25rem
- Weight: Semibold (600)
- Line Height: 1.3
- Usage: Subheadings

Body (Regular)
- Size: 16px / 1rem
- Weight: Regular (400)
- Line Height: 1.5
- Usage: Main content

Body Small
- Size: 14px / 0.875rem
- Weight: Regular (400)
- Line Height: 1.5
- Usage: Secondary text, labels

Caption
- Size: 12px / 0.75rem
- Weight: Regular (400)
- Line Height: 1.4
- Usage: Hints, metadata, timestamps
```

### 2.3 Spacing System

```
Base unit: 4px

Spacing tokens:
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)

Usage:
- Padding (inside elements)
- Margin (outside elements)
- Gap (between items)
```

### 2.4 Border Radius

```
No rounded (utilities):
- 0px: Sharp edges, buttons

Small radius:
- 4px: Form inputs, small components

Medium radius:
- 8px: Cards, modals, medium components

Large radius:
- 12px: Large cards, prominent areas

Pill:
- 9999px: Badges, pills, full rounded
```

### 2.5 Shadows & Elevation

```
No shadow (base)
- Used for: Main content, cards on white

Small shadow (1)
- elevation: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- Used for: Hover states, slight depth

Medium shadow (2)
- elevation: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Used for: Cards, buttons, modals

Large shadow (3)
- elevation: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- Used for: Dropdowns, floating actions, modals

Extra Large shadow (4)
- elevation: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- Used for: Important modals, overlays
```

---

## 3. Component Design System

### 3.1 Buttons

#### Primary Button (CTA)
```
Background: #FF6B35 (Brand Orange)
Text: White (WCAG AAA)
Padding: 12px 24px (vertical x horizontal)
Border Radius: 8px
Font Size: 16px (body regular)
Font Weight: 600 (semibold)
Min Height: 48px (touch target)

States:
- Default: As above
- Hover: Darker shade (#E65A25)
- Active: #CC4A1F
- Disabled: #D1D5DB + cursor-not-allowed

Usage: Primary actions (Unlock, Pay, Publish)
```

#### Secondary Button
```
Background: Transparent
Border: 2px solid #FF6B35
Text: #FF6B35
Padding: 12px 24px
Border Radius: 8px

States:
- Default: As above
- Hover: Background #FFF3E0
- Active: Background #FFE0CC
- Disabled: Gray colors

Usage: Alternative actions (Cancel, Back)
```

#### Tertiary Button (Text)
```
Background: Transparent
Border: None
Text: #FF6B35
Padding: 8px 12px
Font Weight: 500

States:
- Default: As above
- Hover: Background #FFF3E0
- Active: #CC4A1F
- Disabled: #9CA3AF

Usage: Less important actions (View More, Skip)
```

### 3.2 Input Fields

```
Height: 48px (minimum touch target)
Padding: 12px 16px
Border: 1px solid #E5E7EB
Border Radius: 8px
Font Size: 16px
Background: White

States:
- Default: As above
- Focus: Border #FF6B35, outline: 2px solid #FFE0CC
- Error: Border #EF4444, icon: error
- Disabled: Background #F5F5F5, text #9CA3AF

Error Message:
- Font Size: 12px
- Color: #EF4444
- Position: Below input, 4px gap

Label:
- Font Size: 14px
- Font Weight: 500
- Color: #1A1A1A
- Position: Above input, 8px gap

Placeholder:
- Color: #9CA3AF
- Font Weight: 400
```

### 3.3 Cards

```
Container:
- Background: White
- Border: 1px solid #E5E7EB
- Border Radius: 12px
- Padding: 16px
- Shadow: Small (1)
- Hover: Shadow medium, slight scale (1.02)

Property Card (Specific):
- Image: 100% width, 200px height, object-fit: cover
- Title: H3, 20px
- Location: Body Small, gray
- Price: Headline 2, orange
- Bedrooms: Body Small
- Area: Body Small
- [Save] [View] buttons: Primary/Secondary

Responsive:
- Desktop: 2-3 columns
- Tablet: 2 columns
- Mobile: 1 column, full width
```

### 3.4 Modal/Dialog

```
Container:
- Background: White
- Border Radius: 16px
- Max Width: 90vw on mobile, 500px on desktop
- Padding: 24px

Header:
- Close Button: X icon, top-right
- Title: H2, 24px, bold
- Divider: 1px #E5E7EB

Content:
- Padding: 24px 0
- Text: Body regular

Footer:
- Buttons: Primary + Secondary
- Gap: 12px between buttons
- Stack on mobile, inline on desktop

Overlay:
- Background: rgba(0, 0, 0, 0.5)
- Backdrop Filter: blur(4px)
- Click outside: Close modal
```

### 3.5 Forms

```
Form Container:
- Max Width: 500px
- Spacing: 24px between sections

Section:
- Group related inputs
- Optional divider between sections
- Heading: H3

Form Grid:
- Mobile: 1 column
- Tablet+: 2 columns (for date/number inputs)

Submit Button:
- Full width on mobile
- Width: auto on desktop
- Minimum: 200px

Validation:
- Real-time feedback (no submit click needed)
- Error messages inline
- Green checkmark on valid fields (optional)
```

---

## 4. Page Layouts

### 4.1 Mobile Layout

```
Standard Mobile Page:
┌───────────────────────┐
│ Status Bar (System)   │ (Optional)
├───────────────────────┤
│     HEADER / NAV      │ (56px)
├───────────────────────┤
│                       │
│   MAIN CONTENT        │ (Scrollable)
│   (Responsive)        │
│                       │
├───────────────────────┤
│  BOTTOM NAV / TAB BAR │ (56px)
└───────────────────────┘
```

### 4.2 Desktop Layout

```
┌────────────────────────────────────┐
│       HEADER / NAVIGATION          │ (64px)
├────────────────────────────────────┤
│  Sidebar  │       MAIN CONTENT     │
│  (250px)  │     (Responsive)       │
│           │                        │
│           │                        │
│           │                        │
└────────────────────────────────────┘
```

---

## 5. User Interface Specifications

### 5.1 Home / Listing Page

```
┌──────────────────────────────────┐
│ Header (Sticky)                  │
├──────────────────────────────────┤
│ [Thanjavur ▼] [🔍 Search]        │
├──────────────────────────────────┤
│ Filters (Horizontal Scroll)      │
│ [Location] [Price] [Beds] [More] │
├──────────────────────────────────┤
│ Results: 342 properties          │
│ [Sort: Newest ▼]                 │
├──────────────────────────────────┤
│ ┌─────────────────────────────┐  │
│ │ [Image]                     │  │
│ │ Spacious Apartment          │  │
│ │ Nandi Nagar, Thanjavur      │  │
│ │ ₹15,000/mo | 2 BHK | 800 SF │  │
│ │ [Save ❤️] [View Details]   │  │
│ └─────────────────────────────┘  │
│                                  │
│ (Repeated for each property)    │
│                                  │
│ [Load More] or [Page 2 of 10]    │
└──────────────────────────────────┘
```

### 5.2 Property Detail Page

```
┌──────────────────────────────────┐
│ [← Back]           [Share] [❤️]  │
├──────────────────────────────────┤
│ Image Gallery:                   │
│ [Main Image - Swipeable]         │
│ [Thumbnails below]               │
├──────────────────────────────────┤
│ Property Name                    │
│ ⭐ 4.5 (12 reviews) | 120 views  │
├──────────────────────────────────┤
│ ₹15,000 per month                │
│ Security Deposit: ₹45,000         │
│ Maintenance: ₹500/month           │
├──────────────────────────────────┤
│ Quick Details:                   │
│ 🛏️ 2 Bedrooms | 🚿 1 Bathroom   │
│ 📏 800 Sq Ft | 📍 Ground Floor   │
│ 📅 Available: Jun 15, 2026        │
├──────────────────────────────────┤
│ Amenities:                       │
│ ✓ WiFi ✓ Parking ✓ AC            │
│ ✓ Balcony ✓ Security Guard       │
├──────────────────────────────────┤
│ About This Property              │
│ Lorem ipsum dolor sit amet...    │
├──────────────────────────────────┤
│ [Unlock Contact ₹50]             │ (CTA)
│ [Schedule Tour] [Save]           │
└──────────────────────────────────┘
```

### 5.3 Payment Modal

```
┌──────────────────────────────────┐
│ Unlock Contact           [X]     │
├──────────────────────────────────┤
│                                  │
│ Property: Spacious Apartment     │
│ Owner: John Doe                  │
│ Amount: ₹50                      │
│                                  │
│ Payment Method:                  │
│ ◉ UPI                            │
│ ○ Credit/Debit Card             │
│ ○ Net Banking                    │
│ ○ Mobile Wallet                  │
│                                  │
│ [Pay ₹50 Securely]               │ (Primary)
│ [Cancel]                         │ (Secondary)
│                                  │
│ 🔒 Secure payment via Cashfree   │
│                                  │
└──────────────────────────────────┘
```

### 5.4 Account / Profile Page

```
┌──────────────────────────────────┐
│ My Account                       │
├──────────────────────────────────┤
│ [Profile Image]                  │
│ John Doe                         │
│ +919876543210                    │
│ john@email.com                   │
│                                  │
│ [Edit Profile]                   │
├──────────────────────────────────┤
│ Account Stats:                   │
│ Total Unlocks: 12                │
│ Total Spent: ₹600                │
│ Joined: Jun 1, 2026              │
├──────────────────────────────────┤
│ [Payment History]                │
│ [Saved Searches]                 │
│ [Settings]                       │
│ [Help & Support]                 │
│ [Privacy Policy]                 │
│ [Terms of Service]               │
├──────────────────────────────────┤
│ [Logout]                         │
└──────────────────────────────────┘
```

---

## 6. Responsive Design Breakpoints

```
Mobile:       0px - 767px   (Portrait)
Tablet:       768px - 1023px
Desktop:      1024px+

Key Breakpoints:
- 320px: iPhone SE
- 375px: iPhone 12/13
- 414px: iPhone Plus
- 540px: Tablet (Portrait)
- 768px: Tablet (Landscape)
- 1024px: Desktop
- 1280px: Large Desktop
```

---

## 7. Animations & Transitions

### 7.1 Micro Interactions

```
Button Hover:
- Duration: 200ms
- Easing: ease-out
- Transform: scale(1.05)

Button Click:
- Duration: 100ms
- Easing: ease-in
- Transform: scale(0.95)

Page Transition:
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Opacity: 0 → 1

List Item:
- Duration: 150ms
- Easing: ease-out
- Slide in from bottom
```

### 7.2 Loading States

```
Loading Spinner:
- Size: 32px
- Color: #FF6B35
- Duration: 1s
- Infinite rotation

Skeleton Loading:
- Placeholder boxes
- Animated shimmer effect
- Duration: 2s loop

Loading Text:
- "Loading..." with animated dots
- or use spinner icon
```

---

## 8. Accessibility Guidelines

### 8.1 Color Contrast

```
Text on Background:
- Normal text: 4.5:1 ratio (WCAG AA)
- Large text (18px+): 3:1 ratio
- Graphics: 3:1 ratio

Examples:
✓ #1A1A1A (Dark) on #FFFFFF (White): 16:1
✓ #FF6B35 (Orange) on #FFFFFF: 6.3:1
✓ #4B5563 (Gray) on #FFFFFF: 7.5:1
```

### 8.2 Touch Targets

```
Minimum: 48x48px (CSS pixels)
- Buttons, links, interactive elements
- Account for spacing: 8px minimum gap

Exception:
- Inline text links: 18x18px minimum

Implementation:
- Padding: Add to small elements
- Height: Set min-height: 48px
- Width: Set min-width: 48px
```

### 8.3 Focus Indicators

```
Keyboard Focus:
- Visible outline: 2px solid #FF6B35
- Outline offset: 2px
- Applies to: buttons, links, inputs

Tab Order:
- Logical flow (left→right, top→bottom)
- No tab trapping
- Skip links for navigation (if needed)
```

### 8.4 Labels & Hints

```
Form Labels:
- Always visible
- Linked to input via <label for="">
- Font: 14px, weight 500

Placeholder Text:
- Never replaces label
- Hint only, not requirement
- Color: #9CA3AF (lighter)
- Disappears on focus

Error Messages:
- Clear, descriptive
- Color: #EF4444
- Icon: ⚠️
- Links to help text (optional)
```

---

## 9. Dark Mode (Future)

```
Dark Mode Colors:
- Background: #1A1A1A
- Surface: #2D2D2D
- Surface Light: #3D3D3D
- Text: #FFFFFF
- Text Secondary: #BFBFBF

Implementation:
- CSS variables or Tailwind dark: prefix
- System preference detection (prefers-color-scheme)
- Manual toggle in settings
- localStorage persistence
```

---

## 10. Branding Elements

### 10.1 Logo Variations

```
Logo (Full):
- Horizontal: Logo + Text (Vaadagaiku)
- Size: Min 40px height

Logo (Mark):
- Icon only
- Size: Min 32px

Usage:
- App header: Full logo or Mark
- Tab icon: Mark (192x192px)
- Apple icon: Mark (180x180px)
```

### 10.2 Iconography

```
Icon Set: Material Design Icons or Feather Icons
- Consistency: Same set throughout app
- Size: 24px (standard), 32px (large), 16px (small)
- Stroke width: 2px
- Color: Inherit text color or specific color

Common Icons:
- Home: 🏠
- Search: 🔍
- Heart (Save): ❤️
- User: 👤
- Settings: ⚙️
- Back: ←
- Menu: ☰
```

---

## 11. Design Tokens (CSS Variables)

```css
/* Colors */
--color-primary: #FF6B35;
--color-primary-light: #FFE0CC;
--color-primary-dark: #CC4A1F;

--color-text: #1A1A1A;
--color-text-secondary: #4B5563;
--color-text-light: #9CA3AF;

--color-background: #FFFFFF;
--color-background-light: #F5F5F5;
--color-surface: #FFFFFF;

--color-success: #22C55E;
--color-error: #EF4444;
--color-warning: #F59E0B;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Typography */
--font-family: "Inter", sans-serif;
--font-size-body: 16px;
--font-size-sm: 14px;
--line-height-body: 1.5;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Transitions */
--transition-fast: 150ms ease-out;
--transition-normal: 300ms ease-out;
```

---

## 12. Design Handoff

### 12.1 Design Files
- **Tool:** Figma (Recommended)
- **Structure:** Component library + Pages
- **Sharing:** Design system link

### 12.2 Developer Notes
- Spacing/sizing in pixels
- Color hex codes
- Font weights and sizes
- Animation specifications
- Responsive breakpoints

### 12.3 QA Checklist
- [ ] All colors match design
- [ ] Typography sizes correct
- [ ] Spacing/padding correct
- [ ] Buttons are 48px tall
- [ ] Shadows applied correctly
- [ ] Focus states visible
- [ ] Hover states smooth
- [ ] Responsive at all breakpoints
- [ ] Accessibility: contrast ratios ✓
- [ ] Accessibility: touch targets ✓

---

## 13. Design Iterations (Phase 2+)

### Phase 3: Premium Features
- [ ] Featured badge design
- [ ] Boost/promote UI
- [ ] Analytics dashboard
- [ ] A/B test subscription CTA

### Phase 4: Community Features
- [ ] Reviews/ratings UI
- [ ] Messaging interface
- [ ] Notifications center
- [ ] User profile cards

### Phase 5: Advanced
- [ ] Dark mode full support
- [ ] Advanced search UI
- [ ] Comparison tool
- [ ] AI recommendations

---

## 14. Design Resources

### Assets Needed
- [ ] Logo files (SVG, PNG)
- [ ] Icon set (24px, 32px)
- [ ] Product screenshots (for marketing)
- [ ] Brand guidelines PDF

### Tools & Links
- Figma: [Link to design file]
- Zeplin: [For design handoff]
- Fonts: Google Fonts (Inter)
- Icons: Feather Icons or Material Design

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-17  
**Next Review:** 2026-07-17
