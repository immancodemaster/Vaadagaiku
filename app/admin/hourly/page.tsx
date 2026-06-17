'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Booking } from '@/types';

interface BookingRow extends Booking {
  settled?: boolean;
}

const COMMISSION_RATE = 0.1;

function formatHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${suffix}`;
}

export default function AdminBookings() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'bookings'));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BookingRow));
      rows.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
      setBookings(rows);
      setLoading(false);
    };
    load();
  }, []);

  const toggleSettled = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'bookings', id), { settled: !current });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, settled: !current } : b));
  };

  const totalCommission = bookings.reduce((sum, b) => sum + Math.round((b.amount ?? 0) * COMMISSION_RATE), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin_bookings')}</h1>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
          💸 <span className="font-bold text-orange-700">₹{totalCommission.toLocaleString('en-IN')}</span>
          <span className="text-orange-600"> {t('total_commission')}</span>
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
                  <th className="text-left px-4 py-3">{t('col_venue')}</th>
                  <th className="text-left px-4 py-3">{t('col_tenant')}</th>
                  <th className="text-left px-4 py-3">{t('col_date')}</th>
                  <th className="text-left px-4 py-3">{t('col_slot')}</th>
                  <th className="text-right px-4 py-3">{t('paid')}</th>
                  <th className="text-right px-4 py-3">{t('col_commission')}</th>
                  <th className="text-center px-4 py-3">{t('col_settled')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const commission = Math.round((b.amount ?? 0) * COMMISSION_RATE);
                  return (
                    <tr key={b.id} className={`border-t border-gray-50 hover:bg-gray-50 ${b.settled ? 'bg-green-50/40' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.venueName}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {b.userName}
                        {b.players ? <span className="text-gray-400 text-xs"> · {b.players} {t('players')}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{b.date}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatHour(b.hour)}–{formatHour(b.hour + 1)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{(b.amount ?? 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">₹{commission.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => toggleSettled(b.id, !!b.settled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${b.settled ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={t('col_settled')}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${b.settled ? 'translate-x-6' : ''}`} />
                          </button>
                          <span className={`text-[10px] font-medium ${b.settled ? 'text-green-600' : 'text-gray-400'}`}>
                            {b.settled ? t('settled') : t('pending_payout')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('no_bookings')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
