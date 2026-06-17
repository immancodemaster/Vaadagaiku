'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';

type Filter = 'all' | 'verified' | 'unverified' | 'occupied' | 'location';

export default function AdminProperties() {
  const { firebaseUser } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter]         = useState<Filter>('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    const snap = await getDocs(collection(db, 'properties'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Property));
    list.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
    setProperties(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const verify = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'properties', id), {
      verified: !current,
      verifiedAt: !current ? serverTimestamp() : null,
      verifiedBy: !current ? (firebaseUser?.uid ?? '') : '',
    });
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, verified: !current } : p));
  };

  const filtered = properties.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.lenderName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'        ? true :
      filter === 'verified'   ? !!p.verified :
      filter === 'unverified' ? !p.verified :
      filter === 'occupied'   ? !p.available :
      filter === 'location'   ? !!(p.lat && p.lng) : true;
    return matchSearch && matchFilter;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',        label: `All (${properties.length})` },
    { key: 'verified',   label: `✅ Verified (${properties.filter((p) => p.verified).length})` },
    { key: 'unverified', label: `⏳ Unverified (${properties.filter((p) => !p.verified).length})` },
    { key: 'occupied',   label: `🏚 Occupied (${properties.filter((p) => !p.available).length})` },
    { key: 'location',   label: `📍 With Map (${properties.filter((p) => p.lat && p.lng).length})` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Properties</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title, area, lender..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      />

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === f.key ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Property</th>
                  <th className="text-left px-4 py-3">Lender</th>
                  <th className="text-right px-4 py-3">Rent</th>
                  <th className="text-right px-4 py-3">Views</th>
                  <th className="text-right px-4 py-3">👍</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.videoUrl ? (
                            <video src={p.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🏠</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            📍 {p.location}
                            {p.lat && p.lng && <span className="text-green-500 font-bold">·GPS</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.lenderName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">₹{p.rent?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.views ?? 0}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.likesCount ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {p.verified ? (
                          <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">✅ Verified</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">⏳ Unverified</span>
                        )}
                        {!p.available && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">🏚 Occupied</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => verify(p.id, !!p.verified)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            p.verified
                              ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600'
                              : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                          }`}
                        >
                          {p.verified ? 'Unverify' : '✅ Verify'}
                        </button>
                        {p.lat && p.lng && (
                          <a
                            href={`https://maps.google.com/maps?q=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                          >
                            🗺
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No properties found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
