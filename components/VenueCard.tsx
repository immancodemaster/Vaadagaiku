'use client';

import { useRouter } from 'next/navigation';
import { Venue } from '@/types';
import { MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏', football: '⚽', badminton: '🏸',
  basketball: '🏀', volleyball: '🏐', other: '🏟',
};

interface Props { venue: Venue; }

export default function VenueCard({ venue }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div
      className="card mb-4 cursor-pointer active:opacity-80 transition-opacity"
      onClick={() => router.push(`/tenant/hourly/${venue.id}`)}
    >
      {/* Sport banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-5 flex items-center gap-4">
        <span className="text-5xl">{SPORT_EMOJI[venue.sport] ?? '🏟'}</span>
        <div>
          <div className="text-white font-bold text-lg leading-tight">{venue.name}</div>
          <div className="text-orange-100 text-sm capitalize">{venue.sport}</div>
        </div>
        {venue.verified && (
          <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">✅ Verified</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{venue.location}</span>
          </div>
          <div className="text-orange-500 font-bold text-base whitespace-nowrap">
            ₹{(venue.pricingModel === 'per_head' ? (venue.pricePerHead ?? 0) : venue.pricePerHour).toLocaleString('en-IN')}
            <span className="text-gray-400 font-normal text-xs">{venue.pricingModel === 'per_head' ? t('per_head') : t('per_hour')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <Clock size={11} />
          <span>{venue.openFrom}:00 — {venue.openTo}:00</span>
        </div>

        {venue.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{venue.description}</p>
        )}

        <button className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
          {t('book_slot')}
        </button>
      </div>
    </div>
  );
}
