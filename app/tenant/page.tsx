'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Property } from '@/types';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import PropertyCard from '@/components/PropertyCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Home } from 'lucide-react';

interface UnlockedMap { [propertyId: string]: { phone: string; address: string }; }

export default function TenantPage() {
  const { firebaseUser, userProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [tab, setTab]                   = useState<'properties' | 'venues'>('properties');
  const [properties, setProperties]     = useState<Property[]>([]);
  const [unlockedMap, setUnlockedMap]   = useState<UnlockedMap>({});
  const [savedIds, setSavedIds]         = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds]         = useState<Set<string>>(new Set());
  const [loadingProps, setLoadingProps] = useState(true);
  const [filters, setFilters] = useState({ location: '', minRent: '', maxRent: '', propertyType: '' as '' | 'residential' | 'commercial' });

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
    if (!authLoading && userProfile && userProfile.role !== 'tenant') router.replace('/lender');
  }, [authLoading, firebaseUser, userProfile, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const loadData = async () => {
      const [paySnap, saveSnap, likeSnap] = await Promise.all([
        getDocs(query(collection(db, 'payments'), where('userId', '==', firebaseUser.uid), where('status', '==', 'completed'))),
        getDocs(query(collection(db, 'saves'), where('userId', '==', firebaseUser.uid))),
        getDocs(query(collection(db, 'likes'), where('userId', '==', firebaseUser.uid))),
      ]);
      const map: UnlockedMap = {};
      await Promise.all(paySnap.docs.map(async (pd) => {
        const { propertyId } = pd.data();
        const snap = await getDoc(doc(db, 'properties', propertyId));
        if (snap.exists()) { const d = snap.data(); map[propertyId] = { phone: d.phone, address: d.address }; }
      }));
      setUnlockedMap(map);
      setSavedIds(new Set(saveSnap.docs.map((d) => d.data().propertyId as string)));
      setLikedIds(new Set(likeSnap.docs.map((d) => d.data().propertyId as string)));
    };
    loadData();
  }, [firebaseUser]);

  useEffect(() => {
    const q = query(collection(db, 'properties'), where('available', '==', true));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Property));
      list.sort((a, b) => {
        if (b.featured !== a.featured) return b.featured ? 1 : -1;
        return ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0);
      });
      setProperties(list);
      setLoadingProps(false);
    }, () => setLoadingProps(false));
  }, []);

  const handleUnlock = (propertyId: string, phone: string, address: string) =>
    setUnlockedMap((prev) => ({ ...prev, [propertyId]: { phone, address } }));

  const handleSaveToggle = (propertyId: string, saved: boolean) =>
    setSavedIds((prev) => { const n = new Set(prev); saved ? n.add(propertyId) : n.delete(propertyId); return n; });

  const handleLikeToggle = (propertyId: string, liked: boolean) =>
    setLikedIds((prev) => { const n = new Set(prev); liked ? n.add(propertyId) : n.delete(propertyId); return n; });

  const filtered = properties.filter((p) => {
    const locMatch  = !filters.location     || p.location.toLowerCase().includes(filters.location.toLowerCase());
    const minMatch  = !filters.minRent      || p.rent >= Number(filters.minRent);
    const maxMatch  = !filters.maxRent      || p.rent <= Number(filters.maxRent);
    const typeMatch = !filters.propertyType || p.propertyType === filters.propertyType;
    return locMatch && minMatch && maxMatch && typeMatch;
  });

  if (authLoading || (loadingProps && !!firebaseUser)) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Tab toggle */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-orange-50 border border-orange-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab('properties')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'properties' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t('houses')}
          </button>
          <button
            onClick={() => { setTab('venues'); router.push('/tenant/hourly'); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'venues' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t('turfs')}
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="px-4 pt-4 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Home size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('no_properties')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('adjust_filters')}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">
              {filtered.length} {filtered.length === 1 ? t('property_found') : t('properties_found')}
            </p>
            {filtered.map((p) => (
              <PropertyCard
                key={p.id} property={p}
                isSaved={savedIds.has(p.id)} isLiked={likedIds.has(p.id)}
                unlockedPhone={unlockedMap[p.id]?.phone}
                unlockedAddress={unlockedMap[p.id]?.address}
                onUnlock={(phone, address) => handleUnlock(p.id, phone, address)}
                onSaveToggle={(saved) => handleSaveToggle(p.id, saved)}
                onLikeToggle={(liked) => handleLikeToggle(p.id, liked)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
