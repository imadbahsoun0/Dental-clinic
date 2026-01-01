'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once when this component mounts
    if (!hasRedirected) {
      setHasRedirected(true);
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [hasRedirected, isAuthenticated, router]);

  return null;
}
