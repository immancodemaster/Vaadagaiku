'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Venue } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { X } from 'lucide-react';

interface Props {
  venue: Venue;
  date: string;
  hour: number;
  amount: number;
  players?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SlotPaymentModal({ venue, date, hour, amount, players, onClose, onSuccess }: Props) {
  const { firebaseUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatHour = (h: number) => {
    const suffix = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:00 ${suffix}`;
  };

  const loadRazorpay = () =>
    new Promise<void>((resolve) => {
      if (window.Razorpay) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      document.body.appendChild(s);
    });

  const handlePay = async () => {
    if (!firebaseUser || !userProfile) return;
    setLoading(true); setError('');
    try {
      await loadRazorpay();
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, propertyId: venue.id, userId: firebaseUser.uid }),
      });
      const { orderId } = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: amount * 100,
        currency: 'INR',
        name: 'வாடகைக்கு',
        description: `${venue.name} · ${formatHour(hour)} · ${date}`,
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const { success } = await verifyRes.json();
          if (success) {
            await addDoc(collection(db, 'bookings'), {
              venueId: venue.id, venueName: venue.name,
              userId: firebaseUser.uid, userName: userProfile.name,
              date, hour, amount,
              ...(players ? { players } : {}),
              status: 'confirmed',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              createdAt: serverTimestamp(),
            });
            onSuccess();
          } else {
            setError('Payment verification failed.');
            setLoading(false);
          }
        },
        prefill: { contact: userProfile.phone },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setLoading(false) },
      };

      new (window as any).Razorpay(options).open();
    } catch {
      setError(t('failed_save'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl px-5 py-6">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
          <X size={16} className="text-gray-600" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">{t('book_slot')}</h2>
        <p className="text-gray-500 text-sm mb-5">{venue.name}</p>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold text-gray-900">{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-semibold text-gray-900">{formatHour(hour)} – {formatHour(hour + 1)}</span>
          </div>
          {players && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('players')}</span>
              <span className="font-semibold text-gray-900">{players}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-orange-200 pt-2 mt-2">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="font-bold text-orange-600 text-base">₹{amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4 text-red-600 text-sm">{error}</div>}

        <button onClick={handlePay} disabled={loading}
          className="btn-primary flex items-center justify-center gap-2">
          {loading ? <LoadingSpinner size="sm" /> : `Pay ₹${amount.toLocaleString('en-IN')} & Confirm`}
        </button>
      </div>
    </div>
  );
}
