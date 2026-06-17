'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Property, RazorpayOptions, RazorpayResponse } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { Lock, X, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
    Cashfree: {
      checkout: (options: any) => void;
    };
  }
}

interface Props {
  property: Property;
  onClose: () => void;
  onSuccess: (phone: string, address: string) => void;
}

const PAYMENT_GATEWAY = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'cashfree';

export default function PaymentModal({ property, onClose, onSuccess }: Props) {
  const { firebaseUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadCashfree = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPay = async () => {
    if (!firebaseUser || !userProfile) return;
    setError('');
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Payment gateway failed to load. Check your connection.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50,
          propertyId: property.id,
          userId: firebaseUser.uid,
        }),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const { orderId } = await res.json();

      // Razorpay configuration (using backend verification for security)
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: 5000,
        currency: 'INR',
        name: 'Vaadagaiku',
        description: `Unlock contact for "${property.title}"`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // ✅ SECURITY FIX: Call backend verification endpoint
            // Backend verifies payment via Razorpay using server-side RAZORPAY_KEY_SECRET
            // Never trust client-side payment verification
            const verifyRes = await fetch('/api/razorpay/verify-unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: firebaseUser.uid,
                propertyId: property.id,
              }),
            });

            if (!verifyRes.ok) {
              setError('Payment verification failed. Contact support.');
              setLoading(false);
              return;
            }

            const verifyData = await verifyRes.json();

            if (verifyData.success && verifyData.contact) {
              // ✅ Backend already verified payment & recorded unlock
              // Frontend just displays the unlocked contact
              onSuccess(verifyData.contact.phone, verifyData.contact.address);
            } else {
              setError(verifyData.error || 'Payment verification failed. Contact support.');
            }
          } catch (err: any) {
            setError('Failed to verify payment. Contact support.');
            console.error('[ERROR] Payment verification error:', err);
          } finally {
            setLoading(false);
          }
        },
        prefill: { contact: userProfile.phone },
        theme: { color: '#f97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  const handleCashfreePay = async () => {
    if (!firebaseUser || !userProfile) return;
    setError('');
    setLoading(true);

    try {
      const loaded = await loadCashfree();
      if (!loaded) {
        setError('Payment gateway failed to load. Check your connection.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50,
          propertyId: property.id,
          userId: firebaseUser.uid,
        }),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const { orderId, paymentSessionId } = await res.json();

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_modal',
      };

      window.Cashfree.checkout(checkoutOptions);

      // Poll for payment verification via backend endpoint
      // This ensures backend validates payment before unlocking
      const maxAttempts = 30;
      let attempts = 0;

      const pollPaymentVerification = async () => {
        try {
          // Query Firestore for verified payment
          const paymentDoc = await getDoc(
            doc(db, 'payments', `${firebaseUser.uid}_${property.id}`)
          );

          if (paymentDoc.exists() && paymentDoc.data().status === 'completed') {
            const data = paymentDoc.data();
            // ✅ SECURITY: Backend already verified this payment
            onSuccess(data.propertySnapshot.phone, data.propertySnapshot.address);
            setLoading(false);
            return;
          }

          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(pollPaymentVerification, 1000);
          } else {
            setError('Payment verification timeout. Please check your payment status.');
            setLoading(false);
          }
        } catch (err) {
          setError('Failed to verify payment.');
          setLoading(false);
        }
      };

      // Start polling after a short delay to allow webhook to process
      setTimeout(pollPaymentVerification, 2000);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  const handlePay = PAYMENT_GATEWAY === 'razorpay' ? handleRazorpayPay : handleCashfreePay;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <Lock size={20} className="text-orange-500" />
            Unlock Contact
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="bg-orange-50 rounded-2xl p-4 mb-5">
          <div className="font-semibold text-gray-900 mb-1 truncate">{property.title}</div>
          <div className="text-gray-500 text-sm">{property.location}</div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-500">Pay once, view phone number and full address forever.</span>
        </div>

        <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-gray-700 font-medium">Unlock Fee</span>
          <span className="text-2xl font-bold text-orange-500">₹50</span>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Pay ₹50 & Unlock'}
        </button>
      </div>
    </div>
  );
}
