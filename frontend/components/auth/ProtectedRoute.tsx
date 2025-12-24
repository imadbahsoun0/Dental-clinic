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
    const currentUser = useAuthStore((state) => state.currentUser);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            router.push('/login');
        }
    }, [isAuthenticated, currentUser, router]);

    // Show loading or nothing while checking auth
    if (!isAuthenticated || !currentUser) {
        return null;
    }

    return <>{children}</>;
};
