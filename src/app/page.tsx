'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/store/useFamilyStore';
import { ChildDashboard } from '@/components/dashboard/ChildDashboard';
import { ParentDashboard } from '@/components/dashboard/ParentDashboard';
import { LoginScreen } from '@/components/auth/LoginScreen';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useFamilyStore();

  // Redirect pediatricians to clinic dashboard
  useEffect(() => {
    if (currentUser?.role === 'pediatrician') {
      router.push('/clinic');
    }
  }, [currentUser, router]);

  // If user is logged in, show their dashboard
  if (currentUser) {
    if (currentUser.role === 'parent') {
      return <ParentDashboard />;
    } else if (currentUser.role === 'pediatrician') {
      // Show loading while redirecting
      return <div className="min-h-screen flex items-center justify-center">Redirecting to clinic dashboard...</div>;
    } else {
      return <ChildDashboard />;
    }
  }

  // Show login screen if not logged in
  return <LoginScreen />;
}
