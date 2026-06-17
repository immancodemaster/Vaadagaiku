'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { TranslationKey } from '@/lib/translations';

const NAV: { href: string; key: TranslationKey; icon: string }[] = [
  { href: '/admin',            key: 'nav_dashboard',  icon: '📊' },
  { href: '/admin/properties', key: 'nav_properties', icon: '🏠' },
  { href: '/admin/users',      key: 'nav_users',      icon: '👥' },
  { href: '/admin/deals',      key: 'nav_deals',      icon: '🤝' },
  { href: '/admin/hourly',     key: 'nav_bookings',   icon: '⚽' },
  { href: '/admin/map',        key: 'nav_map',        icon: '🗺' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !userProfile) { router.replace('/login'); return; }
    if (userProfile.role !== 'admin') router.replace('/login');
  }, [loading, firebaseUser, userProfile, router]);

  if (loading || !userProfile || userProfile.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 bg-gray-900 text-white flex-col">
        <div className="px-4 pt-8 pb-5 border-b border-gray-700">
          <div className="text-orange-400 font-bold text-xl">வாடகைக்கு</div>
          <div className="text-gray-400 text-xs mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                pathname === item.href ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span> {t(item.key)}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="w-full mb-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs font-bold transition-colors"
          >
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>
          <div className="text-gray-300 text-sm font-medium mb-1">{userProfile.name}</div>
          <div className="text-gray-500 text-xs mb-3">{userProfile.phone}</div>
          <button
            onClick={async () => { await signOut(auth); router.replace('/login'); }}
            className="text-red-400 text-xs hover:text-red-300 font-medium"
          >
            {t('sign_out')}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <div className="text-orange-400 font-bold text-base">வாடகைக்கு</div>
          <div className="text-gray-400 text-xs">Admin</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="text-white text-xs font-bold bg-gray-800 px-2.5 py-1.5 rounded-lg"
          >
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          <button
            onClick={async () => { await signOut(auth); router.replace('/login'); }}
            className="text-red-400 text-xs font-medium border border-red-400/30 px-3 py-1.5 rounded-lg"
          >
            {t('sign_out')}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="md:ml-56 min-h-screen pb-20 md:pb-0">
        <main className="p-4 md:p-6 max-w-5xl mx-auto">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40 flex">
        {NAV.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
              pathname === item.href ? 'text-orange-400' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] leading-tight text-center">{t(item.key)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
