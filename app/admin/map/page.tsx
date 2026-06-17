'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Property } from '@/types';
import AdminMapView from '@/components/AdminMapView';

export default function AdminMap() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'properties')).then((snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Property))
        .filter((p) => p.lat && p.lng);
      setProperties(list);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Properties Map</h1>
        <div className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          📍 {properties.length} with GPS
        </div>
      </div>
      <div className="flex gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"/> Verified</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"/> Unverified</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/> Occupied</span>
      </div>
      <AdminMapView properties={properties} />
    </div>
  );
}
