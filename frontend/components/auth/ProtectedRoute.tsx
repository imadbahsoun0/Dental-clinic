'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const currentUser = useAuthStore((state) => state.currentUser);

    useEffect(() => {
        // Only redirect if we're done initializing and not authenticated
        if (!isInitializing && (!isAuthenticated || !currentUser)) {
            router.push('/login');
        }
    }, [isInitializing, isAuthenticated, currentUser, router]);

    // Show loading while initializing or checking auth
    if (isInitializing || !isAuthenticated || !currentUser) {
        return null;
    }

    return <>{children}</>;
};
