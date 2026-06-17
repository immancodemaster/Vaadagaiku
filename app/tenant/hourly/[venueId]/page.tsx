'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Venue } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import SlotPaymentModal from '@/components/SlotPaymentModal';
import { ArrowLeft, MapPin, Clock, CheckCircle } from 'lucide-react';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏', football: '⚽', badminton: '🏸',
  basketball: '🏀', volleyball: '🏐', other: '🏟',
};

function formatHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

function getNextDays(n: number): string[] {
  const days: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateLabel(iso: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { firebaseUser, userProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [venue, setVenue]               = useState<Venue | null>(null);
  const [loading, setLoading]           = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookedHours, setBookedHours]   = useState<number[]>([]);
  const [players, setPlayers]           = useState(1);
  const [showPayModal, setShowPayModal] = useState(false);
  const [bookingDone, setBookingDone]   = useState(false);

  const days = getNextDays(7);

  useEffect(() => {
    if (!authLoading && !firebaseUser) { router.replace('/login'); return; }
    if (!venueId) return;
    getDoc(doc(db, 'venues', venueId)).then((snap) => {
      if (snap.exists()) {
        const v = { id: snap.id, ...snap.data() } as Venue;
        setVenue(v);
        setSelectedDate(getNextDays(7)[0]);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, authLoading, firebaseUser]);

  // Real-time booked slots for selected date
  useEffect(() => {
    if (!venueId || !selectedDate) return;
    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId),
      where('date', '==', selectedDate),
      where('status', '==', 'confirmed')
    );
    return onSnapshot(q, (snap) => {
      setBookedHours(snap.docs.map((d) => d.data().hour as number));
    });
  }, [venueId, selectedDate]);

  const handleBookingSuccess = () => {
    setShowPayModal(false);
    setBookingDone(true);
    setSelectedHour(null);
    setTimeout(() => setBookingDone(false), 3000);
  };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (!venue) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Venue not found</div>;
  }

  const hours = Array.from({ length: venue.openTo - venue.openFrom }, (_, i) => venue.openFrom + i);
  const isPerHead = venue.pricingModel === 'per_head';
  const unitPrice = isPerHead ? (venue.pricePerHead ?? 0) : venue.pricePerHour;
  const total = isPerHead ? unitPrice * players : unitPrice;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-orange-400/60 text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-lg">{venue.name}</h1>
          {venue.verified && <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">✅ Verified</span>}
        </div>
        <div className="flex items-center gap-4 text-orange-100 text-sm">
          <span className="flex items-center gap-1"><MapPin size={13} />{venue.location}</span>
          <span className="flex items-center gap-1"><Clock size={13} />{formatHour(venue.openFrom)}–{formatHour(venue.openTo)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-3xl">{SPORT_EMOJI[venue.sport] ?? '🏟'}</span>
          <div>
            <span className="text-white font-bold text-xl">₹{unitPrice.toLocaleString('en-IN')}</span>
            <span className="text-orange-200 text-sm">{isPerHead ? t('per_head') : t('per_hour')}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Description */}
        {venue.description && (
          <div className="card p-4">
            <p className="text-gray-600 text-sm">{venue.description}</p>
          </div>
        )}

        {/* Booking confirmed banner */}
        {bookingDone && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <p className="text-green-700 font-semibold text-sm">{t('booking_confirmed')}</p>
          </div>
        )}

        {/* Date picker */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">{t('select_date')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day, i) => (
              <button key={day} onClick={() => { setSelectedDate(day); setSelectedHour(null); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  selectedDate === day ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {formatDateLabel(day, i)}
              </button>
            ))}
          </div>
        </div>

        {/* Hour grid */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">{t('select_time')}</p>
          <div className="grid grid-cols-3 gap-2">
            {hours.map((h) => {
              const booked   = bookedHours.includes(h);
              const selected = selectedHour === h;
              return (
                <button key={h} disabled={booked} onClick={() => setSelectedHour(selected ? null : h)}
                  className={`py-3 rounded-xl text-xs font-semibold border transition-colors ${
                    booked   ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed' :
                    selected ? 'bg-orange-500 text-white border-orange-500' :
                               'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                  }`}>
                  {formatHour(h)}
                  {booked && <div className="text-[10px] mt-0.5 text-red-400">{t('slot_booked')}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block"/> {t('slot_available')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block"/> {t('slot_selected')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block"/> {t('slot_booked')}</span>
        </div>
      </div>

      {/* Bottom CTA */}
      {selectedHour !== null && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          {/* Player stepper for per-head venues */}
          {isPerHead && (
            <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-sm font-medium text-gray-600">{t('number_of_players')}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setPlayers((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 font-bold flex items-center justify-center">−</button>
                <span className="font-bold text-gray-900 w-6 text-center">{players}</span>
                <button onClick={() => setPlayers((p) => Math.min(50, p + 1))}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 font-bold flex items-center justify-center">+</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">{selectedDate}</p>
              <p className="font-bold text-gray-900">{formatHour(selectedHour)} – {formatHour(selectedHour + 1)}</p>
              {isPerHead && (
                <p className="text-xs text-gray-400">₹{unitPrice} × {players} {t('players')}</p>
              )}
            </div>
            <p className="text-orange-500 font-bold text-lg">₹{total.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={() => setShowPayModal(true)} className="btn-primary">
            {t('book_slot')} · ₹{total.toLocaleString('en-IN')}
          </button>
        </div>
      )}

      {showPayModal && selectedHour !== null && (
        <SlotPaymentModal
          venue={venue}
          date={selectedDate}
          hour={selectedHour}
          amount={total}
          players={isPerHead ? players : undefined}
          onClose={() => setShowPayModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
