'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import PropertyDetailModal from '@/components/PropertyDetailModal';
import { ArrowLeft, MapPin, Eye } from 'lucide-react';

type Tab = 'saved' | 'liked';

interface EnrichedProperty extends Property {
  isLiked: boolean;
  isSaved: boolean;
}

export default function SavedPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('saved');
  const [savedProps, setSavedProps]   = useState<EnrichedProperty[]>([]);
  const [likedProps, setLikedProps]   = useState<EnrichedProperty[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<EnrichedProperty | null>(null);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, { phone: string; address: string }>>({});

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const load = async () => {
      const [saveSnap, likeSnap, paySnap] = await Promise.all([
        getDocs(query(collection(db, 'saves'), where('userId', '==', firebaseUser.uid))),
        getDocs(query(collection(db, 'likes'), where('userId', '==', firebaseUser.uid))),
        getDocs(query(collection(db, 'payments'), where('userId', '==', firebaseUser.uid), where('status', '==', 'completed'))),
      ]);

      const savedPropIds = saveSnap.docs.map((d) => d.data().propertyId as string);
      const likedPropIds = likeSnap.docs.map((d) => d.data().propertyId as string);
      const allIds = Array.from(new Set(savedPropIds.concat(likedPropIds)));

      // Load property docs
      const propMap: Record<string, Property> = {};
      await Promise.all(
        allIds.map(async (id) => {
          const snap = await getDoc(doc(db, 'properties', id));
          if (snap.exists()) propMap[id] = { id: snap.id, ...snap.data() } as Property;
        })
      );

      // Load unlocked
      const unlocked: Record<string, { phone: string; address: string }> = {};
      await Promise.all(
        paySnap.docs.map(async (pd) => {
          const { propertyId } = pd.data();
          if (propMap[propertyId]) {
            unlocked[propertyId] = { phone: propMap[propertyId].phone, address: propMap[propertyId].address };
          }
        })
      );
      setUnlockedMap(unlocked);

      setSavedProps(savedPropIds.filter((id) => propMap[id]).map((id) => ({ ...propMap[id], isSaved: true, isLiked: likedPropIds.includes(id) })));
      setLikedProps(likedPropIds.filter((id) => propMap[id]).map((id) => ({ ...propMap[id], isLiked: true, isSaved: savedPropIds.includes(id) })));
      setLoading(false);
    };
    load();
  }, [firebaseUser]);

  const list = tab === 'saved' ? savedProps : likedProps;

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-12 pb-0 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-orange-400 text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-lg">My Lists</h1>
        </div>
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === 'saved' ? 'text-white border-b-2 border-white' : 'text-orange-200'
            }`}
          >
            ❤️ Saved ({savedProps.length})
          </button>
          <button
            onClick={() => setTab('liked')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === 'liked' ? 'text-white border-b-2 border-white' : 'text-orange-200'
            }`}
          >
            👍 Liked ({likedProps.length})
          </button>
        </div>
      </div>

      <div className="px-4 py-4 pb-20">
        {list.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">{tab === 'saved' ? '❤️' : '👍'}</p>
            <p className="text-gray-500 font-medium">No {tab === 'saved' ? 'saved' : 'liked'} properties yet</p>
            <p className="text-gray-400 text-sm mt-1">Browse listings and {tab === 'saved' ? 'save' : 'like'} ones you like</p>
            <button onClick={() => router.push('/tenant')} className="mt-4 text-orange-500 text-sm font-semibold">
              Browse Properties →
            </button>
          </div>
        ) : (
          list.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm mb-3 overflow-hidden active:opacity-80 transition-opacity"
            >
              {/* Occupied banner */}
              {!p.available && (
                <div className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                  <span>🏠</span> This property is now OCCUPIED — no longer available
                </div>
              )}

              <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-24 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {p.videoUrl ? (
                    <video src={p.videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <span className="text-gray-400 text-2xl">🏠</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{p.title}</p>
                    <p className="text-orange-500 font-bold text-sm whitespace-nowrap">₹{p.rent.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={11} />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye size={11} /> {p.views ?? 0}</span>
                    <span>👍 {p.likesCount ?? 0}</span>
                    <span>❤️ {p.savesCount ?? 0}</span>
                    {p.isLiked && p.isSaved && <span className="text-purple-500">Liked & Saved</span>}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {selected && (
        <PropertyDetailModal
          property={selected}
          isLiked={selected.isLiked}
          isSaved={selected.isSaved}
          unlockedPhone={unlockedMap[selected.id]?.phone}
          unlockedAddress={unlockedMap[selected.id]?.address}
          onClose={() => setSelected(null)}
          onUnlock={(phone, address) => {
            setUnlockedMap((prev) => ({ ...prev, [selected.id]: { phone, address } }));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
