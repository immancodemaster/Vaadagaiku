'use client';

import { useRef, useState } from 'react';
import { Property } from '@/types';
import { MapPin, Phone, X, Star, Eye, Copy, Check, Home, Building2, Lock } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface Props {
  property: Property;
  unlockedPhone?: string;
  unlockedAddress?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onClose: () => void;
  onUnlock?: (phone: string, address: string) => void;
}

const TYPE_CONFIG = {
  residential: { label: 'Home', Icon: Home, bg: 'bg-orange-100 text-orange-700' },
  commercial:  { label: 'Commercial', Icon: Building2, bg: 'bg-blue-100 text-blue-700' },
} as const;

export default function PropertyDetailModal({ property, unlockedPhone, unlockedAddress, isLiked, isSaved, onClose, onUnlock }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeConfig = TYPE_CONFIG[property.propertyType] ?? TYPE_CONFIG.residential;
  const isOccupied = !property.available;
  const isUnlocked = !!unlockedPhone;

  const openDirections = () => {
    if (!property.lat || !property.lng) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${property.lat},${property.lng}&travelmode=driving`;
          window.open(url, '_blank');
        },
        () => window.open(`https://maps.google.com/maps?q=${property.lat},${property.lng}`, '_blank')
      );
    } else {
      window.open(`https://maps.google.com/maps?q=${property.lat},${property.lng}`, '_blank');
    }
  };

  const copyPhone = async () => {
    if (!unlockedPhone) return;
    await navigator.clipboard.writeText(unlockedPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
            <X size={16} className="text-gray-600" />
          </button>

          {/* Verified banner */}
          {property.verified && (
            <div className="mx-4 mt-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="text-blue-700 text-sm font-semibold">Verified by Vaadagaiku Team</span>
            </div>
          )}

          {/* Occupied banner */}
          {isOccupied && (
            <div className="mx-4 mt-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-red-700 font-semibold text-sm">This property is now Occupied</p>
                <p className="text-red-500 text-xs">The owner has marked it as no longer available</p>
              </div>
            </div>
          )}

          {/* Video */}
          <div className="relative bg-black mt-2" style={{ paddingTop: '56.25%' }}>
            {property.videoUrl ? (
              <video
                ref={videoRef}
                src={property.videoUrl}
                controls muted playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <typeConfig.Icon size={40} className="text-gray-300" />
              </div>
            )}
            <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${typeConfig.bg}`}>
              <typeConfig.Icon size={10} /> {typeConfig.label}
            </div>
            {property.featured && (
              <div className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={10} fill="currentColor" /> Featured
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Eye size={10} /> {property.views ?? 0}
            </div>
          </div>

          <div className="px-4 py-4">
            {/* Title + Rent */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-bold text-gray-900 text-lg leading-tight flex-1">{property.title}</h2>
              <div className="text-orange-500 font-bold text-lg whitespace-nowrap">
                ₹{property.rent.toLocaleString('en-IN')}
                <span className="text-gray-400 font-normal text-xs">/mo</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
              <MapPin size={13} className="flex-shrink-0" />
              <span>{property.location}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
              <span>👍 {property.likesCount ?? 0} likes</span>
              <span>❤️ {property.savesCount ?? 0} saved</span>
              {isLiked && <span className="text-blue-500 font-medium">You liked this</span>}
              {isSaved && <span className="text-red-500 font-medium">You saved this</span>}
            </div>

            {/* Description */}
            {property.description && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{property.description}</p>
            )}

            {/* Contact */}
            {!isOccupied && (
              <div className="border-t border-gray-100 pt-4">
                {isUnlocked ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Contact Details</p>
                    <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-green-600" />
                        <span className="font-bold text-green-800">{unlockedPhone}</span>
                      </div>
                      <button onClick={copyPhone} className="text-green-500">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 flex items-start gap-2">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{unlockedAddress}</span>
                    </div>
                    {property.lat && property.lng && (
                      <button
                        onClick={openDirections}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors"
                      >
                        📍 Get Directions (Google Maps)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    <Lock size={16} /> Unlock Contact · ₹50
                  </button>
                )}
              </div>
            )}

            {isOccupied && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-center text-gray-400 text-sm">Contact unavailable — property is occupied</p>
              </div>
            )}

            <div className="h-6" />
          </div>
        </div>
      </div>

      {showPayModal && (
        <PaymentModal
          property={property}
          onClose={() => setShowPayModal(false)}
          onSuccess={(phone, address) => { setShowPayModal(false); onUnlock?.(phone, address); }}
        />
      )}
    </>
  );
}
