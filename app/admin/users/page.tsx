'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { UserProfile } from '@/types';

type Tab = 'lenders' | 'tenants';

interface UserRow extends UserProfile {
  propertyCount?: number;
  unlockCount?: number;
}

export default function AdminUsers() {
  const [tab, setTab]           = useState<Tab>('lenders');
  const [lenders, setLenders]   = useState<UserRow[]>([]);
  const [tenants, setTenants]   = useState<UserRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersSnap, propsSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'properties')),
        getDocs(query(collection(db, 'payments'), where('status', '==', 'completed'))),
      ]);

      const propsByUser: Record<string, number> = {};
      propsSnap.docs.forEach((d) => {
        const uid = d.data().userId;
        propsByUser[uid] = (propsByUser[uid] ?? 0) + 1;
      });

      const unlocksByUser: Record<string, number> = {};
      paymentsSnap.docs.forEach((d) => {
        const uid = d.data().userId;
        unlocksByUser[uid] = (unlocksByUser[uid] ?? 0) + 1;
      });

      const all = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRow));
      setLenders(all.filter((u) => u.role === 'lender').map((u) => ({ ...u, propertyCount: propsByUser[u.id] ?? 0 })));
      setTenants(all.filter((u) => u.role === 'tenant').map((u) => ({ ...u, unlockCount: unlocksByUser[u.id] ?? 0 })));
      setLoading(false);
    };
    load();
  }, []);

  const list = tab === 'lenders' ? lenders : tenants;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Users</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['lenders', 'tenants'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              tab === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {t === 'lenders' ? `👥 Lenders (${lenders.length})` : `🏠 Tenants (${tenants.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-right px-4 py-3">{tab === 'lenders' ? 'Properties' : 'Unlocks'}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">
                    {tab === 'lenders' ? u.propertyCount : u.unlockCount}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={3} className="text-center py-10 text-gray-400">No {tab} yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
