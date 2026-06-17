'use client';

// This page is a fallback for users who authenticated but have no profile yet.
// The normal flow now handles role + name inside the login page directly.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleSelectPage() {
  const { firebaseUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace('/login'); return; }
    if (userProfile)   { router.replace(userProfile.role === 'lender' ? '/lender' : '/tenant'); return; }
    // Has Firebase user but no Firestore profile → send back to login to complete signup
    router.replace('/login');
  }, [loading, firebaseUser, userProfile, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
