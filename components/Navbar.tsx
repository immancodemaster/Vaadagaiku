'use client';

import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, Plus, Bookmark } from 'lucide-react';

interface NavbarProps {
  showAdd?: boolean;
  onAdd?: () => void;
}

export default function Navbar({ showAdd, onAdd }: NavbarProps) {
  const { userProfile } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <div className="bg-orange-500 px-4 pt-12 pb-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <div className="text-white font-bold text-lg leading-none">{t('app_name')}</div>
        </button>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="px-2 py-1 bg-orange-400 hover:bg-orange-300 rounded-lg text-white text-xs font-bold transition-colors"
          >
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>

          {showAdd && (
            <button
              onClick={onAdd}
              className="bg-white text-orange-500 rounded-xl px-3 py-1.5 text-sm font-semibold flex items-center gap-1"
            >
              <Plus size={15} /> {t('add_property')}
            </button>
          )}

          {userProfile?.role === 'tenant' && (
            <button
              onClick={() => router.push('/tenant/saved')}
              className="p-2 rounded-full bg-orange-400 hover:bg-orange-300 transition-colors"
              title={t('saved_liked')}
            >
              <Bookmark size={16} className="text-white" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-white text-xs font-medium">{userProfile?.name}</div>
              <div className="text-orange-200 text-xs capitalize">{userProfile?.role}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full bg-orange-400 hover:bg-orange-300 transition-colors"
              title={t('sign_out')}
            >
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
