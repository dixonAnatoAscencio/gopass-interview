import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-gray-100)',
    }}>
      <Outlet />
    </div>
  );
}
