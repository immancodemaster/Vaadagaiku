import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vaadagaiku – Rent Simplified',
  description: 'Find and list rental properties in Thanjavur and beyond.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <main className="min-h-screen max-w-md mx-auto bg-white shadow-sm">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
