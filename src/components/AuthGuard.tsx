import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthGuard: Checking auth...');
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('AuthGuard: Auth state changed', { user, isLoading });
    if (!isLoading && !user && location.pathname !== '/login') {
      console.log('AuthGuard: Redirecting to login');
      navigate('/login');
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}