import { useState, useMemo } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  PriorityBadge, StatusBadge, Avatar, MetricCard, PageHeader,
} from '../../../shared/components/ui/ui-components';
import {
  TASKS, getUserById, getProjectById, getDaysOverdue, getPriorityLabel, type MockTask,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type OverdueTasksPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
  onOpenTask: (task: MockTask) => void;
};

type GroupBy = 'priority' | 'project' | 'assignee';

type Group = {
  key: string;
  label: string;
  tasks: MockTask[];
};

const overdueActionStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: '4px 8px',
  fontSize: 11,
  fontWeight: 600,
  background: bg,
  color,
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  fontFamily: 'inherit',
});

const priorityColors: Record<string, string> = {
  urgent: '#e11d48',
  high:   '#ea580c',
  medium: '#d97706',
  low:    '#16a34a',
};

export function OverdueTasksPage({ addToast, onOpenTask }: OverdueTasksPageProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('priority');
  const [tasks, setTasks]     = useState<MockTask[]>(TASKS);

  const overdue = useMemo<MockTask[]>(() => {
    const today = new Date('2026-06-10');
    return tasks.filter(
      t => t.status !== 'done' && t.status !== 'archived' && new Date(t.dueDate) < today,
    );
  }, [tasks]);

  const critical         = overdue.filter(t => t.priority === 'urgent');
  const thisWeek         = overdue.filter(t => getDaysOverdue(t.dueDate) <= 7);
  const noOwner          = overdue.filter(t => !t.assigneeId);
  const affectedProjects = [...new Set(overdue.map(t => t.projectId))];

  const grouped = useMemo<Group[]>(() => {
    if (groupBy === 'priority') {
      const order = ['urgent', 'high', 'medium', 'low'];
      return order
        .map(p => ({ key: p, label: getPriorityLabel(p), tasks: overdue.filter(t => t.priority === p) }))
        .filter(g => g.tasks.length > 0);
    }
    if (groupBy === 'project') {
      return [...new Set(overdue.map(t => t.projectId))].map(pid => {
        const p = getProjectById(pid);
        return { key: pid, label: p?.name ?? pid, tasks: overdue.filter(t => t.projectId === pid) };
      });
    }
    if (groupBy === 'assignee') {
      const assigneeIds = [...new Set(overdue.map(t => t.assigneeId))];
      return assigneeIds.map(aid => {
        const u = getUserById(aid);
        return {
          key: String(aid),
          label: u?.name ?? 'Sin asignar',
          tasks: overdue.filter(t => t.assigneeId === aid),
        };
      });
    }
    return [{ key: 'all', label: 'Todas', tasks: overdue }];
  }, [overdue, groupBy]);

  const quickAction = (taskId: string, action: string) => {
    const msgs: Record<string, string> = {
      reassign:   'Tarea reasignada',
      reschedule: 'Fecha actualizada',
      block:      'Tarea marcada como bloqueada',
      complete:   'Tarea completada',
    };
    if (action === 'complete') {
      setTasks(ts =>
        ts.map(t => (t.id === taskId ? { ...t, status: 'done', completedAt: '2026-06-10' } : t)),
      );
    }
    addToast({ message: msgs[action], type: 'success' });
  };

  return (
    <div>
      <PageHeader
        title="Tareas vencidas"
        subtitle="Prioriza el trabajo que requiere atención inmediata"
      />

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}
      >
        <MetricCard
          icon="zap"
          iconBg="#fff1f2"
          iconColor="#e11d48"
          value={critical.length}
          label="Vencidas críticas"
          subtitle="Prioridad urgente"
          change={critical.length > 0 ? 'Atención inmediata' : undefined}
          changeType="negative"
        />
        <MetricCard
          icon="clock"
          iconBg="#fff7ed"
          iconColor="#ea580c"
          value={thisWeek.length}
          label="Vencidas esta semana"
          subtitle="Últimos 7 días"
        />
        <MetricCard
          icon="user"
          iconBg="#fff5f5"
          iconColor="#dc2626"
          value={noOwner.length}
          label="Sin responsable"
          subtitle="Requieren asignación"
          change={noOwner.length > 0 ? 'Asignar ahora' : undefined}
          changeType="negative"
        />
        <MetricCard
          icon="folder"
          iconBg="#fffbeb"
          iconColor="#d97706"
          value={affectedProjects.length}
          label="Proyectos afectados"
          subtitle="Con al menos 1 vencida"
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {overdue.length} tarea{overdue.length !== 1 ? 's' : ''} vencida
          {overdue.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Agrupar por:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {([['priority', 'Prioridad'], ['project', 'Proyecto'], ['assignee', 'Responsable']] as [GroupBy, string][]).map(
              ([v, l]) => (
                <button
                  key={v}
                  onClick={() => setGroupBy(v)}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: groupBy === v ? '#6366f1' : 'white',
                    color: groupBy === v ? 'white' : 'var(--text-secondary)',
                    border: groupBy === v ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {l}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {overdue.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            ¡Sin tareas vencidas!
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            El equipo está al día con todas las tareas.
          </p>
        </div>
      )}

      {grouped.map(
        group =>
          group.tasks.length > 0 && (
            <div key={group.key} style={{ marginBottom: 20 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
              >
                {groupBy === 'priority' && (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: priorityColors[group.key] ?? '#94a3b8',
                    }}
                  />
                )}
                {groupBy === 'assignee' && (
                  <Avatar user={getUserById(Number(group.key))} size="sm" />
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {group.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    background: 'var(--bg)',
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: '1px solid var(--border)',
                  }}
                >
                  {group.tasks.length} tarea{group.tasks.length !== 1 ? 's' : ''}
                </span>
                {groupBy === 'priority' && group.key === 'urgent' && (
                  <span className="badge badge-urgent" style={{ fontSize: 10 }}>
                    ⚠ Crítico
                  </span>
                )}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      {['Tarea', 'Proyecto', 'Responsable', 'Prioridad', 'Días de atraso', 'Estado', 'Acciones rápidas'].map(
                        h => <th key={h}>{h}</th>,
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {group.tasks.map(t => {
                      const proj     = getProjectById(t.projectId);
                      const assignee = getUserById(t.assigneeId);
                      const days     = getDaysOverdue(t.dueDate);
                      return (
                        <tr key={t.id}>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                cursor: 'pointer',
                              }}
                              onClick={() => onOpenTask(t)}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>
                                  {t.title}
                                </div>
                                {t.tags.length > 0 && (
                                  <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                                    {t.tags.slice(0, 2).map(tag => (
                                      <span
                                        key={tag}
                                        className="tag"
                                        style={{ padding: '1px 5px', fontSize: 10 }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {proj && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div
                                  style={{ width: 7, height: 7, borderRadius: 2, background: proj.color }}
                                />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                                  {proj.name.length > 20
                                    ? proj.name.slice(0, 18) + '…'
                                    : proj.name}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            {assignee ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Avatar user={assignee} size="sm" />
                                <span style={{ fontSize: 12.5 }}>
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="badge badge-blocked" style={{ fontSize: 10 }}>
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td>
                            <PriorityBadge priority={t.priority} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background:
                                    days >= 7 ? '#fff1f2' : days >= 3 ? '#fff7ed' : '#fffbeb',
                                  color:
                                    days >= 7 ? '#e11d48' : days >= 3 ? '#ea580c' : '#d97706',
                                }}
                              >
                                +{days}d
                              </div>
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={t.status} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              <button
                                onClick={() => quickAction(t.id, 'reassign')}
                                style={overdueActionStyle('#eff6ff', '#2563eb')}
                              >
                                Reasignar
                              </button>
                              <button
                                onClick={() => quickAction(t.id, 'reschedule')}
                                style={overdueActionStyle('#f0fdf4', '#16a34a')}
                              >
                                Nueva fecha
                              </button>
                              <button
                                onClick={() => quickAction(t.id, 'block')}
                                style={overdueActionStyle('#fff5f5', '#dc2626')}
                              >
                                Bloquear
                              </button>
                              <button
                                onClick={() => quickAction(t.id, 'complete')}
                                style={overdueActionStyle('#f0fdf4', '#16a34a')}
                              >
                                <Icon name="check" size={11} /> Completar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ),
      )}

      {overdue.length > 0 && (
        <div
          className="card"
          style={{ marginTop: 8, background: '#fffbeb', borderColor: '#fde68a' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="lightbulb" size={16} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e' }}>
              Acciones sugeridas
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Reasignar las tareas urgentes sin responsable al líder técnico del proyecto.',
              'Mover las tareas bloqueadas a revisión para identificar dependencias.',
              'Actualizar fechas de las tareas de baja prioridad con nuevo objetivo realista.',
            ].map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: '#78350f',
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 99,
                    background: '#f59e0b',
                    flexShrink: 0,
                  }}
                />
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
