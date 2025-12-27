import { create } from 'zustand';
import { User, UserOrganization } from '@/types';
import { useSettingsStore } from './settingsStore';

interface AuthStore {
    currentUser: User | null;
    currentOrg: UserOrganization | null;
    isAuthenticated: boolean;
    needsOrgSelection: boolean; // True when user has multiple orgs and needs to select one
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsOrgSelection?: boolean }>;
    selectOrganization: (orgId: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    initializeAuth: () => void;
}

const AUTH_STORAGE_KEY = 'dentacare_auth_user';
const ORG_STORAGE_KEY = 'dentacare_current_org';

export const useAuthStore = create<AuthStore>()((set, get) => ({
    currentUser: null,
    currentOrg: null,
    isAuthenticated: false,
    needsOrgSelection: false,

    login: async (email: string, password: string) => {
        // Get users from settings store
        const users = useSettingsStore.getState().users;

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Check if user exists
        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Check password
        if (user.password !== password) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Check if user has any active organizations
        const activeOrgs = user.organizations?.filter(org => org.status === 'active') || [];

        if (activeOrgs.length === 0) {
            return { success: false, error: 'No active organizations found. Please contact administrator.' };
        }

        // Save user to localStorage (without password for security)
        const userToStore = { ...user };
        delete userToStore.password;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));

        // If user has only one organization, auto-select it
        if (activeOrgs.length === 1) {
            const org = activeOrgs[0];
            localStorage.setItem(ORG_STORAGE_KEY, org.orgId);
            set({
                currentUser: { ...userToStore, currentOrg: org },
                currentOrg: org,
                isAuthenticated: true,
                needsOrgSelection: false
            });
            return { success: true };
        }

        // User has multiple organizations - needs to select one
        set({
            currentUser: userToStore,
            currentOrg: null,
            isAuthenticated: false,
            needsOrgSelection: true
        });
        return { success: true, needsOrgSelection: true };
    },

    selectOrganization: async (orgId: string) => {
        const { currentUser } = get();

        if (!currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        const selectedOrg = currentUser.organizations?.find(
            org => org.orgId === orgId && org.status === 'active'
        );

        if (!selectedOrg) {
            return { success: false, error: 'Organization not found or inactive' };
        }

        // Save selected organization
        localStorage.setItem(ORG_STORAGE_KEY, orgId);

        set({
            currentUser: { ...currentUser, currentOrg: selectedOrg },
            currentOrg: selectedOrg,
            isAuthenticated: true,
            needsOrgSelection: false
        });

        return { success: true };
    },

    logout: () => {
        set({
            currentUser: null,
            currentOrg: null,
            isAuthenticated: false,
            needsOrgSelection: false
        });
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(ORG_STORAGE_KEY);
    },

    initializeAuth: () => {
        // Load user from localStorage on app start
        try {
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
            const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);

            if (storedUser) {
                const user = JSON.parse(storedUser) as User;

                // Verify user still exists in settings store
                const users = useSettingsStore.getState().users;
                const currentUser = users.find(u => u.id === user.id);

                if (!currentUser) {
                    // User no longer exists - clear session
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    localStorage.removeItem(ORG_STORAGE_KEY);
                    return;
                }

                // Get active organizations
                const activeOrgs = currentUser.organizations?.filter(org => org.status === 'active') || [];

                if (activeOrgs.length === 0) {
                    // No active organizations - clear session
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    localStorage.removeItem(ORG_STORAGE_KEY);
                    return;
                }

                // If we have a stored org ID, try to use it
                if (storedOrgId) {
                    const selectedOrg = activeOrgs.find(org => org.orgId === storedOrgId);

                    if (selectedOrg) {
                        set({
                            currentUser: { ...currentUser, currentOrg: selectedOrg },
                            currentOrg: selectedOrg,
                            isAuthenticated: true,
                            needsOrgSelection: false
                        });
                        return;
                    }
                }

                // If only one org, auto-select it
                if (activeOrgs.length === 1) {
                    const org = activeOrgs[0];
                    localStorage.setItem(ORG_STORAGE_KEY, org.orgId);
                    set({
                        currentUser: { ...currentUser, currentOrg: org },
                        currentOrg: org,
                        isAuthenticated: true,
                        needsOrgSelection: false
                    });
                    return;
                }

                // Multiple orgs - need selection
                set({
                    currentUser,
                    currentOrg: null,
                    isAuthenticated: false,
                    needsOrgSelection: true
                });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(ORG_STORAGE_KEY);
        }
    },
}));
