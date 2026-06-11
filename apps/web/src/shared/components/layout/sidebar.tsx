import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Proyectos' },
  { to: '/tasks/overdue', label: 'Vencidas' },
  { to: '/analytics', label: 'Analíticas' },
  { to: '/recommendations', label: 'Recomendaciones' },
  { to: '/archived', label: 'Archivados' },
  { to: '/settings', label: 'Configuración' },
];

const activeStyle = {
  background: 'var(--color-primary)',
  color: '#fff',
  fontWeight: 600,
};

export function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      background: 'var(--color-gray-900)',
      color: '#fff',
      padding: '1rem 0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '1rem 1.25rem 1.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
        GoPass
      </div>
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.625rem 1.25rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--color-gray-200)',
              borderRadius: '0 0.375rem 0.375rem 0',
              marginRight: '0.75rem',
              ...(isActive ? activeStyle : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
