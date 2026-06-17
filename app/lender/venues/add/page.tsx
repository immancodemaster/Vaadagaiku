'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Sport, PricingModel } from '@/types';

const SPORTS: { value: Sport; emoji: string; label: string }[] = [
  { value: 'cricket',    emoji: '🏏', label: 'Cricket' },
  { value: 'football',   emoji: '⚽', label: 'Football' },
  { value: 'badminton',  emoji: '🏸', label: 'Badminton' },
  { value: 'basketball', emoji: '🏀', label: 'Basketball' },
  { value: 'volleyball', emoji: '🏐', label: 'Volleyball' },
  { value: 'other',      emoji: '🏟', label: 'Other' },
];

export default function AddVenuePage() {
  const { firebaseUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [sport, setSport]   = useState<Sport>('cricket');
  const [pricingModel, setPricingModel] = useState<PricingModel>('per_hour');
  const [form, setForm]     = useState({ name: '', description: '', location: '', address: '', phone: userProfile?.phone?.replace('+91', '') ?? '', pricePerHour: '', pricePerHead: '', openFrom: '5', openTo: '23' });
  const [lat, setLat]       = useState<number | null>(null);
  const [lng, setLng]       = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState('');

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocLoading(false); },
      () => { setError(t('location_denied')); setLocLoading(false); }
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError(t('venue_name')); return; }
    const priceField = pricingModel === 'per_head' ? form.pricePerHead : form.pricePerHour;
    if (!priceField || Number(priceField) <= 0) {
      setError(pricingModel === 'per_head' ? t('price_per_head') : t('price_per_hour')); return;
    }
    if (!form.location.trim()) { setError(t('location_area')); return; }
    if (!firebaseUser || !userProfile) { router.replace('/login'); return; }
    setSaving(true); setError('');
    try {
      await addDoc(collection(db, 'venues'), {
        ownerId: firebaseUser.uid, ownerName: userProfile.name,
        sport, name: form.name.trim(), description: form.description.trim(),
        location: form.location.trim(), address: form.address.trim(),
        phone: form.phone.trim(),
        pricingModel,
        pricePerHour: pricingModel === 'per_hour' ? Number(form.pricePerHour) : 0,
        ...(pricingModel === 'per_head' ? { pricePerHead: Number(form.pricePerHead) } : {}),
        openFrom: Number(form.openFrom), openTo: Number(form.openTo),
        available: true, verified: false,
        ...(lat && lng ? { lat, lng } : {}),
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => router.replace('/lender/venues'), 1500);
    } catch { setError(t('failed_save')); setSaving(false); }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <CheckCircle size={56} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Venue Added!</h2>
        <p className="text-gray-500 mt-2">{t('redirecting')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 px-4 pt-12 pb-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-orange-400 text-white"><ArrowLeft size={18} /></button>
          <h1 className="text-white font-bold text-lg">{t('add_venue')}</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Sport picker */}
        <div className="card p-4">
          <label className="label mb-3 block">{t('sport_type')}</label>
          <div className="grid grid-cols-3 gap-2">
            {SPORTS.map((s) => (
              <button key={s.value} type="button" onClick={() => setSport(s.value)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all gap-1 ${
                  sport === s.value ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'
                }`}>
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card p-4">
          <label className="label mb-2 block">{t('property_location')} <span className="text-gray-400 text-xs">{t('location_optional')}</span></label>
          {lat && lng ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div><p className="text-green-700 font-semibold text-sm">{t('location_saved')}</p><p className="text-green-600 text-xs">{lat.toFixed(5)}°N, {lng.toFixed(5)}°E</p></div>
              <button onClick={() => { setLat(null); setLng(null); }} className="text-red-400 text-xs">{t('location_remove')}</button>
            </div>
          ) : (
            <button type="button" onClick={captureLocation} disabled={locLoading}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 hover:border-orange-400 text-sm font-medium">
              {locLoading ? t('getting_location') : t('use_my_location')}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="label">{t('venue_name')}</label>
            <input type="text" placeholder="e.g. Karanthai Cricket Turf" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('description')}</label>
            <textarea placeholder={t('describe_property')} value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} className="input-field resize-none" />
          </div>
          {/* Pricing model toggle */}
          <div>
            <label className="label mb-2 block">{t('pricing_model')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPricingModel('per_hour')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all gap-0.5 ${
                  pricingModel === 'per_hour' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'
                }`}>
                <span className="font-semibold text-sm">⏱ {t('flat_per_hour')}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{t('flat_per_hour_desc')}</span>
              </button>
              <button type="button" onClick={() => setPricingModel('per_head')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all gap-0.5 ${
                  pricingModel === 'per_head' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'
                }`}>
                <span className="font-semibold text-sm">👤 {t('per_head_label')}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{t('per_head_desc')}</span>
              </button>
            </div>
          </div>

          {pricingModel === 'per_hour' ? (
            <div>
              <label className="label">{t('price_per_hour')}</label>
              <input type="number" inputMode="numeric" placeholder="e.g. 500" value={form.pricePerHour} onChange={(e) => update('pricePerHour', e.target.value)} className="input-field" />
            </div>
          ) : (
            <div>
              <label className="label">{t('price_per_head')}</label>
              <input type="number" inputMode="numeric" placeholder="e.g. 50" value={form.pricePerHead} onChange={(e) => update('pricePerHead', e.target.value)} className="input-field" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Open From (Hour)</label>
              <select value={form.openFrom} onChange={(e) => update('openFrom', e.target.value)} className="input-field">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
              </select>
            </div>
            <div>
              <label className="label">Open Until (Hour)</label>
              <select value={form.openTo} onChange={(e) => update('openTo', e.target.value)} className="input-field">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t('location_area')}</label>
            <input type="text" placeholder={t('location_placeholder')} value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('full_address')}</label>
            <textarea placeholder={t('address_placeholder')} value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">{t('contact_phone')}</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <span className="px-3 py-3 text-gray-500 bg-gray-50 border-r border-gray-200 font-medium text-sm">+91</span>
              <input type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))} className="flex-1 px-3 py-3 focus:outline-none text-gray-900" />
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}

        <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center justify-center gap-2">
          {saving ? <><LoadingSpinner size="sm" /> {t('saving')}</> : `🏟 ${t('add_venue')}`}
        </button>
        <div className="h-8" />
      </div>
    </div>
  );
}
