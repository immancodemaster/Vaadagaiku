'use client';

import { useRef, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Property } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Phone, Eye, Lock, Star, ChevronDown, ChevronUp, Copy, Check, Home, Building2 } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface Props {
  property: Property;
  isLender?: boolean;
  isSaved?: boolean;
  isLiked?: boolean;
  unlockedPhone?: string;
  unlockedAddress?: string;
  onUnlock?: (phone: string, address: string) => void;
  onSaveToggle?: (saved: boolean) => void;
  onLikeToggle?: (liked: boolean) => void;
}

const TYPE_CONFIG = {
  residential: { label: 'Home', Icon: Home, bg: 'bg-orange-100 text-orange-700' },
  commercial:  { label: 'Commercial', Icon: Building2, bg: 'bg-blue-100 text-blue-700' },
} as const;

export default function PropertyCard({
  property, isLender,
  isSaved = false, isLiked = false,
  unlockedPhone, unlockedAddress,
  onUnlock, onSaveToggle, onLikeToggle,
}: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const lastTapRef  = useRef(0);
  const { firebaseUser } = useAuth();

  const [showPayModal, setShowPayModal] = useState(false);
  const [expanded, setExpanded]         = useState(false);
  const [viewCounted, setViewCounted]   = useState(false);
  const [copied, setCopied]             = useState(false);
  const [saved, setSaved]               = useState(isSaved);
  const [liked, setLiked]               = useState(isLiked);
  const [showHeart, setShowHeart]       = useState(false);

  const isUnlocked = !!unlockedPhone;
  const typeConfig = TYPE_CONFIG[property.propertyType] ?? TYPE_CONFIG.residential;

  useEffect(() => { setSaved(isSaved); }, [isSaved]);
  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  // Autoplay on scroll + count view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            if (!viewCounted && !isLender) {
              setViewCounted(true);
              updateDoc(doc(db, 'properties', property.id), { views: increment(1) }).catch(() => {});
            }
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.6 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [property.id, viewCounted, isLender]);

  const doLike = async () => {
    if (!firebaseUser || isLender) return;
    const likeId = `${firebaseUser.uid}_${property.id}`;
    const likeRef = doc(db, 'likes', likeId);
    if (liked) {
      await deleteDoc(likeRef).catch(() => {});
      await updateDoc(doc(db, 'properties', property.id), { likesCount: increment(-1) }).catch(() => {});
      setLiked(false);
      onLikeToggle?.(false);
    } else {
      await setDoc(likeRef, { userId: firebaseUser.uid, propertyId: property.id, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'properties', property.id), { likesCount: increment(1) }).catch(() => {});
      setLiked(true);
      onLikeToggle?.(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      doLike();
    }
    lastTapRef.current = now;
  };

  const toggleSave = async () => {
    if (!firebaseUser || isLender) return;
    const saveId = `${firebaseUser.uid}_${property.id}`;
    const saveRef = doc(db, 'saves', saveId);
    if (saved) {
      await deleteDoc(saveRef).catch(() => {});
      await updateDoc(doc(db, 'properties', property.id), { savesCount: increment(-1) }).catch(() => {});
      setSaved(false);
      onSaveToggle?.(false);
    } else {
      await setDoc(saveRef, { userId: firebaseUser.uid, propertyId: property.id, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'properties', property.id), { savesCount: increment(1) }).catch(() => {});
      setSaved(true);
      onSaveToggle?.(true);
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
      <div ref={cardRef} className="card mb-4">
        {/* Video */}
        <div className="relative bg-black" style={{ paddingTop: '56.25%' }} onClick={handleVideoTap}>
          {property.videoUrl ? (
            <video
              ref={videoRef}
              src={property.videoUrl}
              muted loop playsInline preload="metadata"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <typeConfig.Icon size={32} className="text-gray-300" />
            </div>
          )}

          {/* Type badge */}
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${typeConfig.bg}`}>
            <typeConfig.Icon size={10} />
            {typeConfig.label}
          </div>

          {/* Bottom-left badges */}
          {!property.available && isLender && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              🏠 Occupied
            </div>
          )}
          {property.featured && property.available && (
            <div className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Featured
            </div>
          )}
          {/* Verified badge — bottom right */}
          {property.verified && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              ✅ Verified
            </div>
          )}

          {/* Views */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Eye size={10} /> {property.views ?? 0}
          </div>

          {/* Double-tap like animation */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-5xl animate-ping" style={{ animationDuration: '0.6s', animationIterationCount: 1 }}>👍</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="font-bold text-gray-900 text-base leading-tight">{property.title}</div>
            <div className="text-orange-500 font-bold text-base whitespace-nowrap">
              ₹{property.rent.toLocaleString('en-IN')}
              <span className="text-gray-400 font-normal text-xs">/mo</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1 text-gray-500 text-sm min-w-0">
              <MapPin size={13} className="flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>

            {/* Tenant: like + save buttons */}
            {!isLender && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={doLike}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all ${
                    liked ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <span>👍</span>
                  <span className="text-xs font-medium">{liked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all ${
                    saved ? 'bg-red-50 border-red-300 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <span>❤️</span>
                  <span className="text-xs font-medium">{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            )}

            {/* Lender: stats */}
            {isLender && (
              <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                <span>👍 {property.likesCount ?? 0}</span>
                <span>❤️ {property.savesCount ?? 0}</span>
              </div>
            )}
          </div>

          {property.description && (
            <div className="mb-3">
              <p className={`text-gray-600 text-sm ${!expanded ? 'line-clamp-2' : ''}`}>
                {property.description}
              </p>
              {property.description.length > 80 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-orange-500 text-xs font-medium flex items-center gap-0.5 mt-1"
                >
                  {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> More</>}
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 mt-1">
            {isLender ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={14} className="text-orange-400" />
                <span>{property.phone}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400 text-xs truncate">{property.address}</span>
              </div>
            ) : isUnlocked ? (
              <div className="space-y-2">
                <div className="bg-green-50 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">{unlockedPhone}</span>
                  </div>
                  <button onClick={copyPhone} className="text-green-500">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 flex items-start gap-2">
                  <MapPin size={12} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{unlockedAddress}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPayModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
              >
                <Lock size={14} /> Unlock Contact · ₹50
              </button>
            )}
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
