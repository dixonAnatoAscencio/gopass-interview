import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/layout/sidebar';
import { Header } from '../../shared/components/layout/header';

export function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '1.5rem', background: 'var(--color-gray-50)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
