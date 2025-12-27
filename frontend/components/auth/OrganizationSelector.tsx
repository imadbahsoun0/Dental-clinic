import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function OrganizationSelector() {
    const { currentUser, selectOrganization } = useAuthStore();
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const activeOrgs = currentUser?.organizations?.filter(org => org.status === 'active') || [];

    const handleSelectOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedOrgId) {
            setError('Please select an organization');
            return;
        }

        setIsLoading(true);
        const result = await selectOrganization(selectedOrgId);
        setIsLoading(false);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Failed to select organization');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Select Organization
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {currentUser?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        You have access to multiple organizations. Please select one to continue.
                    </p>
                </div>

                <form onSubmit={handleSelectOrganization} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Organization
                        </label>
                        <div className="space-y-3">
                            {activeOrgs.map((org) => (
                                <label
                                    key={org.id}
                                    className={`
                                        flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                                        ${selectedOrgId === org.orgId
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="organization"
                                        value={org.orgId}
                                        checked={selectedOrgId === org.orgId}
                                        onChange={(e) => setSelectedOrgId(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">
                                                Organization {org.orgId}
                                            </span>
                                            <span className={`
                                                px-2 py-1 text-xs font-medium rounded-full
                                                ${org.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    org.role === 'dentist' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}
                                            `}>
                                                {org.role.charAt(0).toUpperCase() + org.role.slice(1)}
                                            </span>
                                        </div>
                                        {org.role === 'dentist' && org.percentage && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Commission: {org.percentage}%
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !selectedOrgId}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Loading...' : 'Continue'}
                    </button>

                    <button
                        type="button"
                        onClick={() => useAuthStore.getState().logout()}
                        className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
}
