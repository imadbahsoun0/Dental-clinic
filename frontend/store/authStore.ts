import { create } from 'zustand';
import { api, UserDto, UserOrgDto, LoginDto } from '@/lib/api';

interface AuthStore {
    currentUser: UserDto | null;
    currentOrg: UserOrgDto | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    needsOrgSelection: boolean;
    user: UserDto | null; // Alias for compatibility
    login: (data: LoginDto) => Promise<{ success: boolean; error?: string; needsOrgSelection?: boolean }>;
    selectOrganization: (orgId: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    initializeAuth: () => void;
    setUser: (user: UserDto) => void;
}

const AUTH_STORAGE_KEY = 'dentacare_auth_user';
const ORG_STORAGE_KEY = 'dentacare_current_org';
const TOKEN_KEY = 'access_token';

export const useAuthStore = create<AuthStore>()((set, get) => ({
    currentUser: null,
    currentOrg: null,
    isAuthenticated: false,
    isInitializing: true,
    needsOrgSelection: false,
    user: null, // Alias for compatibility

    setUser: (user: UserDto) => {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        set({ currentUser: user, user });
    },

    login: async (data: LoginDto) => {
        try {
            const response = await api.api.authControllerLogin(data);

            if (response.success && response.data) {
                const { user, needsOrgSelection } = response.data;
                // Tokens handled by cookies

                // Save user to storage
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

                // Determine current org
                let currentOrg = user.currentOrg || null;

                // If not set but no selection needed and has orgs, pick first
                if (!currentOrg && !needsOrgSelection && user.organizations && user.organizations.length > 0) {
                    currentOrg = user.organizations[0];
                }

                if (currentOrg) {
                    localStorage.setItem(ORG_STORAGE_KEY, currentOrg.orgId);
                }

                set({
                    currentUser: user,
                    user: user, // Sync alias
                    currentOrg: currentOrg,
                    isAuthenticated: true,
                    isInitializing: false,
                    needsOrgSelection: needsOrgSelection
                });

                return { success: true, needsOrgSelection };
            }
            return { success: false, error: response.message || 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    },

    selectOrganization: async (orgId: string) => {
        try {
            const response = await api.api.authControllerSelectOrganization({ orgId });

            if (response.success && response.data) {
                const { currentOrg } = response.data;
                // Tokens handled by cookies

                localStorage.setItem(ORG_STORAGE_KEY, orgId);

                // Update current user's current org
                const { currentUser } = get();
                const updatedUser = currentUser ? { ...currentUser, currentOrg } : null;
                if (updatedUser) {
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
                }

                set({
                    currentUser: updatedUser,
                    user: updatedUser, // Sync alias
                    currentOrg: currentOrg,
                    isAuthenticated: true,
                    isInitializing: false,
                    needsOrgSelection: false
                });

                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Organization selection failed' };
        }
    },

    logout: async () => {
        try {
            await api.api.authControllerLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(ORG_STORAGE_KEY);
            set({
                currentUser: null,
                user: null, // Sync alias
                currentOrg: null,
                isAuthenticated: false,
                isInitializing: false,
                needsOrgSelection: false
            });
        }
    },

    initializeAuth: () => {
        try {
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
            // We can't check token in localStorage anymore, so we rely on user presence or an initial profile fetch.
            // Ideally, we should fetch /me or similar, but for now strict checking might be tricky without making a request.
            // Let's assume if user is in storage, we are 'potentially' authenticated, but the first API call will fail if no cookies.
            // A better approach is to try a silent refresh or profile fetch here.

            const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);

            if (storedUser) {
                const user = JSON.parse(storedUser) as UserDto;
                let currentOrg = user.currentOrg || null;

                if (!currentOrg && storedOrgId && user.organizations) {
                    currentOrg = user.organizations.find(o => o.orgId === storedOrgId) || null;
                }

                if (!currentOrg && user.organizations && user.organizations.length > 0) {
                    currentOrg = user.organizations[0];
                }

                set({
                    currentUser: user,
                    user: user, // Sync alias
                    currentOrg: currentOrg,
                    isAuthenticated: true,
                    isInitializing: false,
                    needsOrgSelection: !currentOrg && (user.organizations?.length || 0) > 1
                });
            } else {
                set({ isInitializing: false });
            }
        } catch (error) {
            console.error('Init auth error:', error);
            localStorage.clear();
            set({ isInitializing: false });
        }
    }
}));
