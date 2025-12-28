import { Api } from './api';
import { apiClient } from './config';

export const api = new Api({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Inject our custom axios instance with interceptors
api.instance = apiClient;

export * from './api';
