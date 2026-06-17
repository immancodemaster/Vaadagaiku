'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

interface Stats {
  activeHouses: number;
  activeTurfs: number;
  todayRevenue: number;
  totalUnlocks: number;
  pendingVerify: number;
}

interface AreaRow { area: string; count: number; avgRent: number; verified: number; }
interface DayBar { label: string; value: number; }

const UNLOCK_FEE = 50;

function toDateKey(seconds: number): string {
  // seconds → YYYY-MM-DD (local)
  const d = new Date(seconds * 1000);
  return d.toISOString().split('T')[0];
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [areas, setAreas]   = useState<AreaRow[]>([]);
  const [weekly, setWeekly] = useState<DayBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [propsSnap, venuesSnap, paymentsSnap, bookingsSnap] = await Promise.all([
        getDocs(collection(db, 'properties')),
        getDocs(collection(db, 'venues')),
        getDocs(query(collection(db, 'payments'), where('status', '==', 'completed'))),
        getDocs(collection(db, 'bookings')),
      ]);

      const props    = propsSnap.docs.map((d) => d.data());
      const venues   = venuesSnap.docs.map((d) => d.data());
      const payments = paymentsSnap.docs.map((d) => d.data());
      const bookings = bookingsSnap.docs.map((d) => d.data());

      // Build last-7-days date keys (oldest → newest)
      const dayKeys: string[] = [];
      const dayLabels: string[] = [];
      const base = Date.now();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(base - i * 86400000);
        dayKeys.push(d.toISOString().split('T')[0]);
        dayLabels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
      }
      const todayKey = dayKeys[dayKeys.length - 1];

      // Revenue per day = unlock fees + booking commissions (10%)
      const revByDay: Record<string, number> = {};
      dayKeys.forEach((k) => (revByDay[k] = 0));

      payments.forEach((p) => {
        const sec = (p.createdAt as any)?.seconds;
        if (!sec) return;
        const key = toDateKey(sec);
        if (key in revByDay) revByDay[key] += UNLOCK_FEE;
      });
      bookings.forEach((b) => {
        const sec = (b.createdAt as any)?.seconds;
        if (!sec) return;
        const key = toDateKey(sec);
        if (key in revByDay) revByDay[key] += Math.round((b.amount ?? 0) * 0.1);
      });

      const s: Stats = {
        activeHouses:  props.filter((p) => p.available).length,
        activeTurfs:   venues.filter((v) => v.available).length,
        todayRevenue:  revByDay[todayKey] ?? 0,
        totalUnlocks:  payments.length,
        pendingVerify: props.filter((p) => !p.verified).length,
      };
      setStats(s);
      setWeekly(dayKeys.map((k, i) => ({ label: dayLabels[i], value: revByDay[k] })));

      // Area breakdown
      const areaMap: Record<string, { count: number; rentSum: number; verified: number }> = {};
      props.forEach((p) => {
        const area = (p.location as string)?.split(',')[0]?.trim() || 'Unknown';
        if (!areaMap[area]) areaMap[area] = { count: 0, rentSum: 0, verified: 0 };
        areaMap[area].count++;
        areaMap[area].rentSum += p.rent ?? 0;
        if (p.verified) areaMap[area].verified++;
      });
      setAreas(
        Object.entries(areaMap)
          .map(([area, d]) => ({ area, count: d.count, avgRent: Math.round(d.rentSum / d.count), verified: d.verified }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">{t('admin_loading')}</div>;
  if (!stats) return null;

  const cards = [
    { icon: '🏠', label: t('kpi_active_houses'),  value: stats.activeHouses,  grad: 'from-orange-500 to-orange-400' },
    { icon: '⚽', label: t('kpi_active_turfs'),   value: stats.activeTurfs,   grad: 'from-blue-500 to-blue-400' },
    { icon: '💰', label: t('kpi_today_revenue'),  value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, grad: 'from-green-500 to-green-400' },
    { icon: '🔓', label: t('kpi_total_unlocks'),  value: stats.totalUnlocks,  grad: 'from-purple-500 to-purple-400' },
    { icon: '⏳', label: t('kpi_pending_verify'), value: stats.pendingVerify, grad: 'from-rose-500 to-rose-400' },
  ];

  const maxRev = Math.max(...weekly.map((w) => w.value), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin_dashboard')}</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 bg-gradient-to-br ${c.grad} text-white shadow-sm`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-2xl font-bold leading-none">{c.value}</div>
            <div className="text-xs text-white/80 font-medium mt-1.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly earnings bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">📈 {t('weekly_earnings')}</h2>
        <div className="flex items-end justify-between gap-2 h-44">
          {weekly.map((d, i) => {
            const heightPct = Math.round((d.value / maxRev) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-[10px] font-semibold text-gray-600">
                  {d.value > 0 ? `₹${d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'k' : d.value}` : ''}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
                <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Area breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{t('properties_by_area')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">{t('area')}</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">{t('listings')}</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">{t('avg_rent')}</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">{t('verified_col')}</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((row, i) => (
                <tr key={row.area} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-5 py-3 font-medium text-gray-900">{row.area}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.count}</td>
                  <td className="px-5 py-3 text-right text-gray-700">₹{row.avgRent.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-teal-600 font-semibold">{row.verified}</span>
                    <span className="text-gray-400"> / {row.count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
