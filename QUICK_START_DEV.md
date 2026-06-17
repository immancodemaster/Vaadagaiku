# Quick Start - Development Guide
## Vaadagaiku - Get Running in 5 Minutes

**Updated:** 2026-06-17  
**Status:** ✅ Ready to Code

---

## 1. Verify Installation (2 min)

```bash
cd c:\Users\sunna\OneDrive\Desktop\Vaadagaiku

# Check Node version (should be 18+)
node --version

# Check npm is installed
npm --version

# Verify all packages
npm list --depth=0
```

Expected output should include:
- ✅ next@14.2.5
- ✅ react@18.3.1
- ✅ firebase@10.14.1
- ✅ axios (installing...)
- ✅ react-hook-form (installing...)
- ✅ zustand (installing...)

---

## 2. Configure Environment (1 min)

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values
# You need:
# - Firebase credentials (from Firebase Console)
# - Cashfree App ID & Secret (from Cashfree Dashboard)
```

**Firebase Setup (if you don't have it yet):**
1. Go to https://console.firebase.google.com/
2. Create new project "vaadagaiku-prod"
3. Create Firestore database (test mode for now)
4. Enable Authentication > Phone
5. Copy credentials to .env.local

**Cashfree Setup (optional for now):**
1. Go to https://dashboard.cashfree.com/
2. Create merchant account
3. Get Sandbox API keys
4. Add to .env.local

---

## 3. Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
> Ready in 2.3s
> Local:        http://localhost:3000
> Environments: .env.local
```

**Open browser:** http://localhost:3000

---

## 4. Project Structure Overview (1 min)

```
src/
├── app/                    # Next.js pages & routes
│   └── page.tsx           # Homepage
├── components/            # React components
│   └── Common/            # Base UI components
├── lib/                   # Utilities & services
│   ├── firebase.ts        # Firebase config
│   ├── auth.ts            # Auth functions
│   ├── payments.ts        # Payment logic
│   ├── validation.ts      # Input validation
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript types
│   └── index.ts          # All type definitions
└── hooks/                # React hooks
    └── useAuth.ts        # Auth hook

.env.local.example         # Copy to .env.local
```

---

## 5. Available Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check TypeScript
npx tsc --noEmit
```

---

## 6. First Development Task

### Create Your First Page (15 min)

Create `src/app/layout.tsx`:

```typescript
'use client'

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vaadagaiku - Rental Marketplace',
  description: 'Find your perfect rental property'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

Create `src/app/page.tsx`:

```typescript
'use client'

import { Button } from '@/components/Common/Button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Vaadagaiku</h1>
      <p className="text-lg text-gray-600">Find your perfect rental</p>
      <Button href="#" size="lg">
        Get Started
      </Button>
    </div>
  )
}
```

Save → Page reloads automatically! 🎉

---

## 7. Testing Your Code

### Test Component
```typescript
import { Button } from '@/components/Common/Button'

// The Button is ready to use:
<Button variant="primary" size="md">
  Click me
</Button>
```

### Test API
Create `src/app/api/test/route.ts`:

```typescript
export async function GET() {
  return Response.json({ message: 'API working!' })
}
```

Visit: http://localhost:3000/api/test

---

## 8. Debugging Tips

### VS Code Extensions (Recommended)
- ES7+ React/Redux snippets
- Tailwind CSS IntelliSense
- Firebase Explorer
- Thunder Client (API testing)

### Console Output
- Check browser console (F12) for errors
- Check terminal for server errors
- TypeScript errors show in editor

### Clear Cache
```bash
# Remove Next.js cache
rm -rf .next

# Reinstall packages
rm -rf node_modules package-lock.json
npm install
```

---

## 9. Deployment Preview

When ready to deploy:

```bash
# Build for production
npm run build

# Test production build locally
npm start
# Visit http://localhost:3000
```

Then push to GitHub and Vercel auto-deploys!

---

## 10. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Port 3000 already in use** | `npm run dev -- -p 3001` |
| **Packages not found** | `npm install` |
| **TypeScript errors** | Check `types/index.ts` imports |
| **Firebase not connecting** | Verify .env.local has credentials |
| **Hot reload not working** | Restart dev server |

---

## 📚 Documentation

- **Types:** See `types/index.ts` (160 lines, all types documented)
- **Utilities:** See `lib/` folder (auth, validation, utils)
- **Components:** See `components/Common/` (Button, Card, etc)
- **Design:** See `FIGMA_WIREFRAME_GUIDE.md`
- **Planning:** See `IMPLEMENTATION_STATUS.md`

---

## 🎯 Next Steps After "npm run dev" Works

1. **Create auth page** → `app/(auth)/page.tsx`
2. **Create API routes** → `app/api/auth/send-otp/route.ts`
3. **Create property listing** → `app/(property)/page.tsx`
4. **Test with Firebase** → Sign up, verify login
5. **Deploy to Vercel** → Push to GitHub

---

## 💡 Pro Tips

✅ **Use TypeScript** - Types are your friend, autocomplete helps!  
✅ **Import from aliases** - Use `@/` paths, no relative imports  
✅ **Check types/index.ts** - All data types are defined  
✅ **Copy existing code** - PaymentModal.tsx is good reference  
✅ **Commit early** - `git commit -am "feat: add auth page"`

---

## 🚀 You're Ready!

```bash
npm run dev
# http://localhost:3000
# Happy coding! 🎉
```

---

**Questions?** Check the docs folder or look at existing code for patterns.

