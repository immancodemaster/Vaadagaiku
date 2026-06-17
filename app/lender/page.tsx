'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Trash2, Star, StarOff, Home, Pencil } from 'lucide-react';

export default function LenderPage() {
  const { firebaseUser, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
    if (!authLoading && userProfile && userProfile.role !== 'lender') router.replace('/tenant');
  }, [authLoading, firebaseUser, userProfile, router]);

  useEffect(() => {
    if (!firebaseUser) { setLoadingProps(false); return; }
    const q = query(
      collection(db, 'properties'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsub = onSnapshot(q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Property));
        list.sort((a, b) => {
          const at = (a.createdAt as any)?.seconds ?? 0;
          const bt = (b.createdAt as any)?.seconds ?? 0;
          return bt - at;
        });
        setProperties(list);
        setLoadingProps(false);
      },
      () => setLoadingProps(false)
    );
    return unsub;
  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    setDeletingId(id);
    await deleteDoc(doc(db, 'properties', id));
    setDeletingId(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'properties', id), { featured: !current });
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'properties', id), { available: !current });
  };

  if (authLoading || loadingProps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAdd onAdd={() => router.push('/lender/add-property')} />

      {/* Houses / Turfs toggle */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-orange-50 border border-orange-100 p-1 rounded-2xl">
          <button
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-white text-orange-600 shadow-sm"
          >
            🏠 Houses
          </button>
          <button
            onClick={() => router.push('/lender/venues')}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-500"
          >
            ⚽ Turfs & Stadiums
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-20">
        <h1 className="section-title mb-1">My Listings</h1>
        <p className="text-gray-400 text-sm mb-5">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <Home size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No listings yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Add your first property to get started</p>
            <button
              onClick={() => router.push('/lender/add-property')}
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} /> Add Property
            </button>
          </div>
        ) : (
          properties.map((p) => (
            <div key={p.id} className="mb-4">
              <PropertyCard property={p} isLender />
              {/* Lender action bar */}
              <div className="flex gap-2 mt-2 px-1">
                <button
                  onClick={() => router.push(`/lender/edit-property/${p.id}`)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => toggleAvailable(p.id, p.available)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    p.available
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  }`}
                >
                  {p.available ? '✅ Available' : '🏠 Occupied'}
                </button>
                <button
                  onClick={() => toggleFeatured(p.id, p.featured)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    p.featured
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {p.featured ? <Star size={12} fill="currentColor" /> : <StarOff size={12} />}
                  {p.featured ? 'Featured' : 'Feature'}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  {deletingId === p.id ? <LoadingSpinner size="sm" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
