'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { firebaseUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace('/login');
    } else if (!userProfile) {
      router.replace('/role-select');
    } else if (userProfile.role === 'admin') {
      router.replace('/admin');
    } else if (userProfile.role === 'lender') {
      router.replace('/lender');
    } else {
      router.replace('/tenant');
    }
  }, [loading, firebaseUser, userProfile, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-500 mb-2">வாடகைக்கு</div>
        <div className="text-gray-500 text-sm mb-6">Vaadagaiku</div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
