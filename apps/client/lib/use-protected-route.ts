import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function useProtectedRoute() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Listen for 401 events dispatched by the api-client interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      logout();
      router.push('/login');
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout, router]);

  return { user, isLoading };
}
