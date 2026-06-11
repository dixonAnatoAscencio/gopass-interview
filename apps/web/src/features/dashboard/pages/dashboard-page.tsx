import { useQuery } from '@tanstack/react-query';
import { get } from '../../../shared/services/http-client';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () =>
      get<{ totalProjects: number; totalTasks: number; overdueTasks: number; completionRate: number }>(
        '/analytics/summary',
      ),
  });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Proyectos', value: data?.totalProjects ?? 0 },
          { label: 'Tareas Totales', value: data?.totalTasks ?? 0 },
          { label: 'Tareas Vencidas', value: data?.overdueTasks ?? 0 },
          { label: 'Completado', value: `${data?.completionRate ?? 0}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
