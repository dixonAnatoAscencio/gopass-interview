import { useAuthStore } from '../../stores/auth.store';

export function Header() {
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));

  return (
    <header style={{
      height: '56px',
      background: '#fff',
      borderBottom: '1px solid var(--color-gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 1.5rem',
      gap: '1rem',
    }}>
      {user && (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
          {user.name}
        </span>
      )}
      <button
        onClick={logout}
        style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-gray-200)',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Salir
      </button>
    </header>
  );
}
