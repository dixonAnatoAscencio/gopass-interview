import { useState, useMemo } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  RiskBadge, Avatar, ProgressBar, Btn, EmptyState, PageHeader,
  FilterSelect, SearchInput, Skeleton,
} from '../../../shared/components/ui/ui-components';
import {
  USERS, PROJECTS, getUserById, formatDate, type MockProject,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';
import { useProjects, useArchiveProject } from '../hooks/use-projects';
import type { ProjectDto } from '@gopass/contracts';

type ProjectsListPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
  onNewProject: () => void;
};

type ViewMode = 'cards' | 'table';

const projectStatusCls = (s: string): string =>
  ({
    active: 'badge-progress',
    at_risk: 'badge-blocked',
    in_progress: 'badge-review',
    completed: 'badge-done',
    archived: 'badge-archived',
  }[s] ?? 'badge-todo');

const projectStatusLabel = (s: string): string =>
  ({
    active: 'Activo',
    at_risk: 'En riesgo',
    in_progress: 'En progreso',
    completed: 'Completado',
    archived: 'Archivado',
  }[s] ?? s);

// Adapter: convierte ProjectDto del API al shape que usa la UI
function toMockProject(p: ProjectDto): MockProject {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    status: p.status.toLowerCase(),
    progress: p.completedTasksCount > 0 ? Math.round((p.completedTasksCount / (p.tasksCount || 1)) * 100) : 0,
    ownerId: 0,
    memberIds: [],
    totalTasks: p.tasksCount ?? 0,
    completedTasks: p.completedTasksCount ?? 0,
    overdueTasks: 0,
    blockedTasks: 0,
    startDate: p.createdAt,
    targetDate: '',
    color: p.color ?? '#6366f1',
    riskLevel: 'low',
    createdAt: p.createdAt,
  };
}

export function ProjectsListPage({ navigate, addToast, onNewProject }: ProjectsListPageProps) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter]   = useState('');
  const [viewMode, setViewMode]         = useState<ViewMode>('cards');

  const { data: apiData, isLoading, isError } = useProjects();
  const archiveMutation = useArchiveProject();

  // Usa datos reales del API; si no están disponibles, cae al mock
  const allProjects: MockProject[] = useMemo(() => {
    if (apiData?.data) return apiData.data.map(toMockProject);
    return PROJECTS;
  }, [apiData]);

  const filtered = useMemo(
    () =>
      allProjects.filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter && p.status !== statusFilter) return false;
        if (ownerFilter && String(p.ownerId) !== ownerFilter) return false;
        return true;
      }),
    [allProjects, search, statusFilter, ownerFilter],
  );

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id, {
      onSuccess: () => addToast({ message: 'Proyecto archivado', type: 'success' }),
      onError: () => addToast({ message: 'Error al archivar proyecto', type: 'error' }),
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setOwnerFilter('');
  };

  // handleArchive already declared above — remove this duplicate

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Proyectos" subtitle="Cargando…" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
          {[1,2,3,4].map(i => <div key={i} className="card"><Skeleton height={160} /></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Proyectos" />
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <p style={{ color:'var(--text-muted)' }}>Error cargando proyectos. Mostrando datos locales.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Proyectos"
        subtitle="Administra tus proyectos activos y archivados"
        actions={[
          <Btn key="np" variant="primary" size="sm" icon="plus" onClick={onNewProject}>
            Crear proyecto
          </Btn>,
        ]}
      />

      <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar proyecto…" />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Estado"
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'at_risk', label: 'En riesgo' },
              { value: 'in_progress', label: 'En progreso' },
              { value: 'completed', label: 'Completado' },
              { value: 'archived', label: 'Archivado' },
            ]}
          />
          <FilterSelect
            value={ownerFilter}
            onChange={setOwnerFilter}
            placeholder="Responsable"
            options={USERS.map(u => ({ value: String(u.id), label: u.name }))}
          />
          {(search || statusFilter || ownerFilter) && (
            <Btn variant="ghost" size="sm" icon="x" onClick={clearFilters}>
              Limpiar
            </Btn>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('cards')}
              title="Vista cards"
            >
              <Icon name="grid" size={14} />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Vista tabla"
            >
              <Icon name="list" size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>
        {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} encontrado
        {filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="folder"
          title="Sin proyectos"
          description="No se encontraron proyectos que coincidan con los filtros actuales."
          action={
            <Btn variant="primary" icon="plus" onClick={onNewProject}>
              Crear primer proyecto
            </Btn>
          }
        />
      )}

      {viewMode === 'cards' && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map(p => {
            const owner   = getUserById(p.ownerId);
            const members = p.memberIds.map(getUserById).filter(Boolean);
            return (
              <div
                key={p.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                }}
              >
                <div style={{ height: 4, background: p.color }} />
                <div style={{ padding: '16px 18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                        <span className={`badge ${projectStatusCls(p.status)}`}>
                          {projectStatusLabel(p.status)}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {p.name}
                      </h3>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0 4px', flexShrink: 0 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Icon name="more-vertical" size={14} />
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.description}
                  </p>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11.5,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                        Progreso general
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.progress}%
                      </span>
                    </div>
                    <ProgressBar value={p.progress} />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { label: 'Total',      value: p.totalTasks,    color: 'var(--text-secondary)' },
                      { label: 'Vencidas',   value: p.overdueTasks,  color: p.overdueTasks > 0 ? '#dc2626' : 'var(--text-muted)' },
                      { label: 'Bloqueadas', value: p.blockedTasks,  color: p.blockedTasks > 0 ? '#ea580c' : 'var(--text-muted)' },
                    ].map(s => (
                      <div
                        key={s.label}
                        style={{
                          textAlign: 'center',
                          padding: '8px 4px',
                          background: 'var(--bg)',
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar user={owner} size="sm" />
                      <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {owner?.name}
                      </span>
                      {members.length > 1 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          +{members.length - 1}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn variant="primary" size="sm" onClick={() => navigate('project-detail')}>
                        Ver
                      </Btn>
                      <Btn variant="ghost" size="sm" onClick={() => handleArchive(p.id)}>
                        <Icon name="archive" size={13} />
                      </Btn>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'table' && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {['Proyecto', 'Estado', 'Responsable', 'Progreso', 'Tareas', 'Vence', 'Riesgo', 'Acciones'].map(
                    h => <th key={h}>{h}</th>,
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const owner = getUserById(p.ownerId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${projectStatusCls(p.status)}`}>
                          {projectStatusLabel(p.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={owner} size="sm" />
                          <span style={{ fontSize: 12.5 }}>{owner?.name}</span>
                        </div>
                      </td>
                      <td style={{ width: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProgressBar value={p.progress} height={5} />
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28 }}>
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {p.completedTasks}/{p.totalTasks}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {formatDate(p.targetDate)}
                        </span>
                      </td>
                      <td>
                        <RiskBadge level={p.riskLevel} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Btn variant="ghost" size="sm" onClick={() => navigate('project-detail')}>
                            Ver
                          </Btn>
                          <Btn variant="ghost" size="sm" onClick={() => {}}>
                            <Icon name="edit" size={13} />
                          </Btn>
                          <Btn variant="ghost" size="sm" onClick={() => handleArchive(p.id)}>
                            <Icon name="archive" size={13} />
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
