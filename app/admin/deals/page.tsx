'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Payment } from '@/types';

interface DealRow extends Payment {
  tenantName: string;
  tenantPhone: string;
  lenderName: string;
}

function formatDate(seconds?: number): string {
  if (!seconds) return '—';
  return new Date(seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function AdminDeals() {
  const { t } = useLanguage();
  const [deals, setDeals]     = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(collection(db, 'payments'), where('status', '==', 'completed')));
      const rows = await Promise.all(
        snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() } as Payment;
          const [userSnap, propSnap] = await Promise.all([
            getDoc(doc(db, 'users', data.userId)),
            getDoc(doc(db, 'properties', data.propertyId)),
          ]);
          return {
            ...data,
            tenantName:  userSnap.exists() ? userSnap.data().name : 'Unknown',
            tenantPhone: userSnap.exists() ? userSnap.data().phone : '',
            lenderName:  propSnap.exists() ? propSnap.data().lenderName : '—',
          } as DealRow;
        })
      );
      rows.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
      setDeals(rows);
      setLoading(false);
    };
    load();
  }, []);

  const toggleSuccess = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'payments', id), { happy: !current });
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, happy: !current } : d));
  };

  const successCount = deals.filter((d) => d.happy).length;
  const totalRevenue = deals.length * 50;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin_deals')}</h1>
        <div className="flex gap-2">
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
            💰 <span className="font-bold text-orange-700">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm">
            😊 <span className="font-bold text-green-700">{successCount}</span>
            <span className="text-green-600"> {t('happy_customers')}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">{t('admin_loading')}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">{t('col_tenant')}</th>
                  <th className="text-left px-4 py-3">{t('col_phone')}</th>
                  <th className="text-left px-4 py-3">{t('col_owner')}</th>
                  <th className="text-right px-4 py-3">{t('col_amount')}</th>
                  <th className="text-center px-4 py-3">{t('col_status')}</th>
                  <th className="text-left px-4 py-3">{t('col_date')}</th>
                  <th className="text-center px-4 py-3">{t('col_deal_success')}</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className={`border-t border-gray-50 hover:bg-gray-50 ${d.happy ? 'bg-green-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.tenantName}</td>
                    <td className="px-4 py-3 text-gray-500">{d.tenantPhone}</td>
                    <td className="px-4 py-3 text-gray-700">{d.lenderName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">₹{d.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('paid')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate((d.createdAt as any)?.seconds)}</td>
                    <td className="px-4 py-3">
                      {/* Toggle switch */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleSuccess(d.id, !!d.happy)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${d.happy ? 'bg-green-500' : 'bg-gray-300'}`}
                          title={t('col_deal_success')}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform flex items-center justify-center text-[10px] ${d.happy ? 'translate-x-6' : ''}`}>
                            {d.happy ? '😊' : ''}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deals.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('no_deals')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
