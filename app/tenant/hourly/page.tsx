'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Venue } from '@/types';
import Navbar from '@/components/Navbar';
import VenueCard from '@/components/VenueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const SPORTS = ['all', 'cricket', 'football', 'badminton', 'basketball', 'volleyball'];
const SPORT_EMOJI: Record<string, string> = {
  all: '🏟', cricket: '🏏', football: '⚽',
  badminton: '🏸', basketball: '🏀', volleyball: '🏐',
};

export default function HourlyPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [venues, setVenues]       = useState<Venue[]>([]);
  const [sport, setSport]         = useState('all');
  const [loadingVenues, setLoadingVenues] = useState(true);

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    const q = query(collection(db, 'venues'), where('available', '==', true));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
      list.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
      setVenues(list);
      setLoadingVenues(false);
    }, () => setLoadingVenues(false));
  }, []);

  const filtered = sport === 'all' ? venues : venues.filter((v) => v.sport === sport);

  if (authLoading || loadingVenues) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back + Title */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => router.push('/tenant')} className="p-2 rounded-full bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{t('browse_venues')}</h1>
      </div>

      {/* Sport filter pills */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {SPORTS.map((s) => (
          <button key={s} onClick={() => setSport(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              sport === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
            }`}>
            {SPORT_EMOJI[s]} {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏟</p>
            <p className="text-gray-500 font-medium">{t('no_venues')}</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{filtered.length} venue{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.map((v) => <VenueCard key={v.id} venue={v} />)}
          </>
        )}
      </div>
    </div>
  );
}
