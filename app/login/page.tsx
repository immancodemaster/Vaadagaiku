'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowRight, RefreshCw, Home, Search, User } from 'lucide-react';

declare global {
  interface Window { recaptchaVerifier: RecaptchaVerifier | null; }
}

type Step = 'role' | 'phone' | 'otp' | 'name';
type Role = 'tenant' | 'lender';

export default function LoginPage() {
  const [step, setStep]           = useState<Step>('role');
  const [role, setRole]           = useState<Role | null>(null);
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [name, setName]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const router = useRouter();
  const { firebaseUser, userProfile, loading: authLoading, refreshProfile } = useAuth();

  // Redirect if already logged in with a profile
  useEffect(() => {
    if (!authLoading && firebaseUser && userProfile) {
      if (userProfile.role === 'admin') router.replace('/admin');
      else if (userProfile.role === 'lender') router.replace('/lender');
      else router.replace('/tenant');
    }
  }, [authLoading, firebaseUser, userProfile, router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const resetRecaptcha = () => {
    try { window.recaptchaVerifier?.clear(); } catch {}
    window.recaptchaVerifier = null;
    const el = document.getElementById('recaptcha-container');
    if (el) el.innerHTML = '';
  };

  const getRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': resetRecaptcha,
      });
    }
    return window.recaptchaVerifier;
  };

  const sendOtp = async () => {
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      if (auth.currentUser) await signOut(auth);
      resetRecaptcha();
      const verifier = getRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${digits}`, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      resetRecaptcha();
      const code: string = err?.code ?? '';
      if (code.includes('too-many-requests'))   setError('Too many attempts. Wait a few minutes.');
      else if (code.includes('quota-exceeded')) setError('Daily SMS limit reached. Use test number +91 9999999999 / 123456.');
      else if (code.includes('operation-not-allowed')) setError('Phone auth not enabled in Firebase. Enable it in Firebase Console → Authentication → Sign-in method → Phone → Save.');
      else setError(`Error: ${code || err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmationRef.current) return;
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      if (snap.exists()) {
        // existing user — AuthContext will redirect
      } else {
        // new user — ask for name
        setStep('name');
      }
    } catch (err: any) {
      const code: string = err?.code ?? '';
      if (code.includes('invalid-verification-code')) setError('Wrong OTP. Try again.');
      else if (code.includes('code-expired'))         setError('OTP expired. Go back and resend.');
      else setError(`Error: ${code || err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!firebaseUser) return;
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name.trim(),
        phone: firebaseUser.phoneNumber ?? '',
        role: role!,
        createdAt: serverTimestamp(),
      });
      await refreshProfile();
      router.replace(role === 'lender' ? '/lender' : '/tenant');
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 px-6 pt-16 pb-10 text-white text-center">
        <div className="text-4xl font-bold mb-1">வாடகைக்கு</div>
        <div className="text-orange-100 text-sm">Rent Simplified · Thanjavur</div>
      </div>

      <div className="flex-1 bg-gray-50 px-6 pt-8">

        {/* ── STEP 1: Role ── */}
        {step === 'role' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">I am a...</h2>
            <p className="text-gray-500 text-sm mb-6">Choose how you want to use Vaadagaiku</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setRole('tenant')}
                className={`flex flex-col items-center py-6 rounded-2xl border-2 transition-all gap-2 ${
                  role === 'tenant'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                <Search size={36} />
                <span className="font-bold text-sm">Tenant</span>
                <span className="text-xs text-gray-400 text-center leading-tight">Looking for a home or shop</span>
              </button>

              <button
                onClick={() => setRole('lender')}
                className={`flex flex-col items-center py-6 rounded-2xl border-2 transition-all gap-2 ${
                  role === 'lender'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                <Home size={36} />
                <span className="font-bold text-sm">Owner</span>
                <span className="text-xs text-gray-400 text-center leading-tight">Listing a property to rent</span>
              </button>
            </div>

            <button
              onClick={() => { if (!role) { setError('Please select your role first'); return; } setError(''); setStep('phone'); }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>

            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </div>
        )}

        {/* ── STEP 2: Phone ── */}
        {step === 'phone' && (
          <div className="card p-6">
            <button onClick={() => { setStep('role'); setError(''); }} className="text-orange-500 text-sm font-medium mb-4 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {role === 'tenant' ? 'Find your home' : 'List your property'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">Sign in with your mobile number</p>

            <label className="label">Mobile Number</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400 mb-4">
              <span className="px-3 py-3 text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                className="flex-1 px-3 py-3 focus:outline-none text-gray-900"
                autoFocus
              />
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4"><p className="text-red-600 text-sm">{error}</p></div>}

            <button onClick={sendOtp} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <>Send OTP <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── STEP 3: OTP ── */}
        {step === 'otp' && (
          <div className="card p-6">
            <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-orange-500 text-sm font-medium mb-4 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter OTP</h2>
            <p className="text-gray-500 text-sm mb-6">Sent to +91 {phone}</p>

            <label className="label">6-Digit OTP</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              className="input-field text-center text-2xl tracking-widest mb-4"
              autoFocus
            />

            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4"><p className="text-red-600 text-sm">{error}</p></div>}

            <button onClick={verifyOtp} disabled={loading} className="btn-primary flex items-center justify-center gap-2 mb-4">
              {loading ? <LoadingSpinner size="sm" /> : 'Verify & Continue'}
            </button>

            <div className="text-center">
              {countdown > 0
                ? <span className="text-gray-400 text-sm">Resend in {countdown}s</span>
                : <button onClick={sendOtp} disabled={loading} className="text-orange-500 text-sm font-medium flex items-center gap-1 mx-auto"><RefreshCw size={14} /> Resend OTP</button>
              }
            </div>
          </div>
        )}

        {/* ── STEP 4: Name (new users only) ── */}
        {step === 'name' && (
          <div className="card p-6">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">What is your name?</h2>
            <p className="text-gray-500 text-sm mb-6 text-center">This is shown to people you connect with</p>

            <label className="label">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              className="input-field mb-4"
              autoFocus
            />

            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4"><p className="text-red-600 text-sm">{error}</p></div>}

            <button onClick={saveName} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Get Started'}
            </button>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-6 px-4 pb-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
