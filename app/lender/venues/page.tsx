'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Venue } from '@/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Trash2, MapPin } from 'lucide-react';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏', football: '⚽', badminton: '🏸',
  basketball: '🏀', volleyball: '🏐', other: '🏟',
};

export default function LenderVenuesPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [venues, setVenues]       = useState<Venue[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) { setLoading(false); return; }
    const q = query(collection(db, 'venues'), where('ownerId', '==', firebaseUser.uid));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
      list.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
      setVenues(list);
      setLoading(false);
    }, () => setLoading(false));
  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this venue?')) return;
    setDeletingId(id);
    await deleteDoc(doc(db, 'venues', id));
    setDeletingId(null);
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'venues', id), { available: !current });
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAdd onAdd={() => router.push('/lender/venues/add')} />

      {/* Houses / Turfs toggle */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-orange-50 border border-orange-100 p-1 rounded-2xl">
          <button
            onClick={() => router.push('/lender')}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-500"
          >
            🏠 Houses
          </button>
          <button className="flex-1 py-2 rounded-xl text-sm font-semibold bg-white text-orange-600 shadow-sm">
            ⚽ Turfs & Stadiums
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-20">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t('my_venues')}</h1>
        <p className="text-gray-400 text-sm mb-5">{venues.length} venue{venues.length !== 1 ? 's' : ''}</p>

        {venues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🏟</p>
            <p className="text-gray-500 font-medium">No venues yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Add your sports turf or stadium</p>
            <button onClick={() => router.push('/lender/venues/add')}
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              <Plus size={16} /> {t('add_venue')}
            </button>
          </div>
        ) : (
          venues.map((v) => (
            <div key={v.id} className="card mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-4 flex items-center gap-3">
                <span className="text-3xl">{SPORT_EMOJI[v.sport] ?? '🏟'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{v.name}</p>
                  <p className="text-orange-100 text-xs capitalize">{v.sport}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{v.pricePerHour.toLocaleString('en-IN')}</p>
                  <p className="text-orange-100 text-xs">{t('per_hour')}</p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                  <MapPin size={11} /> {v.location}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvailable(v.id, v.available)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      v.available ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    {v.available ? '✅ Available' : '🏚 Unavailable'}
                  </button>
                  <button onClick={() => handleDelete(v.id)} disabled={deletingId === v.id}
                    className="px-3 py-2 rounded-xl text-xs bg-red-50 text-red-500 border border-red-200">
                    {deletingId === v.id ? <LoadingSpinner size="sm" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
