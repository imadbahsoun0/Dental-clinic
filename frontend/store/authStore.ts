import { create } from 'zustand';
import { User } from '@/types';
import { useSettingsStore } from './settingsStore';

interface AuthStore {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    initializeAuth: () => void;
}

const AUTH_STORAGE_KEY = 'dentacare_auth_user';

export const useAuthStore = create<AuthStore>()((set) => ({
    currentUser: null,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
        // Get users from settings store
        const users = useSettingsStore.getState().users;

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Check if user exists and is active
        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        if (user.status !== 'active') {
            return { success: false, error: 'Account is inactive. Please contact administrator.' };
        }

        // Check password
        if (user.password !== password) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Login successful - set current user and save to localStorage
        set({ currentUser: user, isAuthenticated: true });

        // Save to localStorage (without password for security)
        const userToStore = { ...user };
        delete userToStore.password;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));

        return { success: true };
    },

    logout: () => {
        set({ currentUser: null, isAuthenticated: false });
        localStorage.removeItem(AUTH_STORAGE_KEY);
    },

    initializeAuth: () => {
        // Load user from localStorage on app start
        try {
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
            if (storedUser) {
                const user = JSON.parse(storedUser) as User;

                // Verify user still exists and is active in settings store
                const users = useSettingsStore.getState().users;
                const currentUser = users.find(u => u.id === user.id);

                if (currentUser && currentUser.status === 'active') {
                    set({ currentUser, isAuthenticated: true });
                } else {
                    // User no longer exists or is inactive - clear session
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    },
}));
