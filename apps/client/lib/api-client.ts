import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 s — surface "Network Error" faster
});

// ── Include token in every request ───────────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Read from sessionStorage (new) with localStorage fallback (old)
            const token =
                sessionStorage.getItem('sukuu_token') ||
                localStorage.getItem('school_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Handle 401 responses (expired / invalid token) ───────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isAuthMeRequest = error.config?.url?.includes('/auth/me');

        // Only redirect on 401 when it's NOT a login or session-restore request
        if (error.response?.status === 401 && !isLoginRequest && !isAuthMeRequest) {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('sukuu_token');
                localStorage.removeItem('school_token');
                localStorage.removeItem('school_user');
                // Use Next.js router-safe navigation via event instead of hard redirect
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
        }
        return Promise.reject(error);
    }
);
