import axios from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        // No need to manually attach tokens, cookies are sent automatically withCredentials: true
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh token for auth endpoints themselves
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/select-organization');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                // Call refresh endpoint - cookies are sent automatically
                // The response will set the new access/refresh cookies
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/refresh`,
                    {},
                    { withCredentials: true },
                );

                // Retry original request - new cookies will be sent automatically
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, user needs to login again
                if (typeof window !== 'undefined') {
                    // Optional: redirect to login
                    // window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);
