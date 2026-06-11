import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-danger)' }}>403</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-gray-600)', marginTop: '1rem' }}>
        No tienes permisos para ver esta página
      </p>
      <Link to="/dashboard" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--color-primary)' }}>
        Volver al dashboard
      </Link>
    </div>
  );
}
