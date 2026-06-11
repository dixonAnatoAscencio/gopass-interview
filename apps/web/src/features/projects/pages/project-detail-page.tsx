import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  StatusBadge, RiskBadge, Avatar, AvatarGroup, ProgressBar, Btn, Tabs,
  MetricCard, FormGroup, InsightCard,
} from '../../../shared/components/ui/ui-components';
import {
  PROJECTS, ACTIVITIES, RECOMMENDATIONS, USERS, getUserById, getProjectById,
  getTasksByProject, formatDate, formatRelative, getStatusLabel, type MockTask,
} from '../../../mock-data';
import { KanbanBoard } from '../../tasks/pages/task-board-page';
import type { AddToast } from '../../../app/layouts/AppShell';

type ProjectDetailPageProps = {
  projectId?: string;
  navigate: (p: string) => void;
  addToast: AddToast;
  onOpenTask: (task: MockTask) => void;
};

type TabId =
  | 'board'
  | 'list'
  | 'analytics'
  | 'activity'
  | 'recommendations'
  | 'settings';

export function ProjectDetailPage({
  projectId = 'p1',
  onOpenTask,
  addToast,
  navigate,
}: ProjectDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('board');
  const project = getProjectById(projectId) ?? PROJECTS[0];
  const owner   = getUserById(project.ownerId);
  const tasks   = getTasksByProject(project.id);

  const tabs = [
    { id: 'board',           label: 'Tablero',        icon: 'columns' },
    { id: 'list',            label: 'Lista',           icon: 'list' },
    { id: 'analytics',       label: 'Analíticas',      icon: 'bar-chart' },
    { id: 'activity',        label: 'Actividad',       icon: 'activity' },
    { id: 'recommendations', label: 'Recomendaciones', icon: 'lightbulb' },
    { id: 'settings',        label: 'Configuración',   icon: 'settings' },
  ];

  const tasksByStatus = (s: string) => tasks.filter(t => t.status === s);
  const statusOrder = ['todo', 'in_progress', 'blocked', 'in_review', 'done'];

  const statusColors: Record<string, string> = {
    todo: '#94a3b8',
    in_progress: '#6366f1',
    blocked: '#ef4444',
    in_review: '#f59e0b',
    done: '#10b981',
  };

  const chartData = statusOrder.map(s => ({
    label: getStatusLabel(s),
    value: tasksByStatus(s).length,
    color: statusColors[s],
  }));
  const maxVal = Math.max(1, ...chartData.map(d => d.value));

  return (
    <div>
      <button
        onClick={() => navigate('projects')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        <Icon name="chevron-left" size={14} />
        Volver a proyectos
      </button>

      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 5, background: project.color }} />
        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
              >
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
                <RiskBadge level={project.riskLevel} />
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                {project.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Icon name="calendar" size={13} />
                  <span>Inicio: {formatDate(project.startDate)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Icon name="target" size={13} />
                  <span>Objetivo: {formatDate(project.targetDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar user={owner} size="sm" />
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {owner?.name}
                  </span>
                </div>
                <AvatarGroup userIds={project.memberIds} max={4} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Btn
                variant="primary"
                size="sm"
                icon="plus"
                onClick={() =>
                  addToast({ message: 'Abriendo formulario de nueva tarea…', type: 'info' })
                }
              >
                Nueva tarea
              </Btn>
              <Btn variant="secondary" size="sm" icon="edit" onClick={() => {}}>
                Editar
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                icon="archive"
                onClick={() => addToast({ message: 'Proyecto archivado', type: 'success' })}
              >
                Archivar
              </Btn>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar value={project.progress} height={8} />
            </div>
            <span
              style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', minWidth: 42 }}
            >
              {project.progress}%
            </span>
          </div>
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 20 }}
      >
        {[
          { icon: 'activity',     iconBg: '#eff6ff', iconColor: '#6366f1', value: `${project.progress}%`,  label: 'Progreso' },
          { icon: 'check-square', iconBg: '#f5f3ff', iconColor: '#7c3aed', value: project.totalTasks,      label: 'Total tareas' },
          { icon: 'check-circle', iconBg: '#f0fdf4', iconColor: '#16a34a', value: project.completedTasks,  label: 'Completadas' },
          { icon: 'clock',        iconBg: '#fff1f2', iconColor: '#e11d48', value: project.overdueTasks,    label: 'Vencidas' },
          { icon: 'alert-circle', iconBg: '#fff5f5', iconColor: '#dc2626', value: project.blockedTasks,    label: 'Bloqueadas' },
          { icon: 'target',       iconBg: '#fffbeb', iconColor: '#d97706', value: '3.2d',                  label: 'Tiempo prom.' },
        ].map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={v => setActiveTab(v as TabId)} />
      </div>

      {activeTab === 'board' && (
        <KanbanBoard projectId={project.id} onOpenTask={onOpenTask} />
      )}

      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                {['Tarea', 'Estado', 'Prioridad', 'Responsable', 'Vence', 'Acciones'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const a = getUserById(t.assigneeId);
                return (
                  <tr
                    key={t.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenTask(t)}
                  >
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{t.title}</span>
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      {a ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={a} size="sm" />
                          <span style={{ fontSize: 12.5 }}>{a.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {formatDate(t.dueDate)}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Btn variant="ghost" size="sm" onClick={() => onOpenTask(t)}>
                          Ver
                        </Btn>
                        <Btn variant="ghost" size="sm">
                          <Icon name="edit" size={13} />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Tareas por estado</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
              {chartData.map(d => (
                <div
                  key={d.label}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(6, (d.value / maxVal) * 70)}px`,
                      background: d.color,
                      borderRadius: '3px 3px 0 0',
                      opacity: 0.85,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9.5,
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 52,
                    }}
                  >
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Distribución de prioridad</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                ['urgent', 'Urgente', '#e11d48'],
                ['high',   'Alta',    '#ea580c'],
                ['medium', 'Media',   '#6366f1'],
                ['low',    'Baja',    '#10b981'],
              ] as [string, string, string][]).map(([p, l, c]) => {
                const cnt = tasks.filter(t => t.priority === p).length;
                const pct = Math.round((cnt / Math.max(1, tasks.length)) * 100);
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{ fontSize: 12, color: 'var(--text-secondary)', width: 68, flexShrink: 0 }}
                    >
                      {l}
                    </span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 99 }}>
                      <div
                        style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 99 }}
                      />
                    </div>
                    <span
                      style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 30 }}
                    >
                      {cnt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <div className="card-title">Carga por responsable</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {USERS.filter(u => project.memberIds.includes(u.id)).map(u => {
                const userTasks = tasks.filter(t => t.assigneeId === u.id);
                const doneTasks = userTasks.filter(t => t.status === 'done').length;
                const pct = Math.round((doneTasks / Math.max(1, userTasks.length)) * 100);
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar user={u} size="sm" />
                    <span
                      style={{ fontSize: 13, fontWeight: 600, width: 120, flexShrink: 0 }}
                    >
                      {u.name}
                    </span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 99 }}>
                      <div
                        style={{ height: '100%', width: `${pct}%`, background: u.color, borderRadius: 99 }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 72 }}>
                      {doneTasks}/{userTasks.length} hechas
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <div className="timeline">
            {ACTIVITIES.filter(a => a.projectId === project.id).map(a => {
              const u = getUserById(a.userId);
              return (
                <div key={a.id} className="timeline-item">
                  <Avatar user={u} size="sm" />
                  <div className="timeline-content">
                    <div className="timeline-title">
                      <strong>{u?.name}</strong>
                      {` ${a.action} `}
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{a.entity}</span>
                    </div>
                    <div className="timeline-meta">{formatRelative(a.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECOMMENDATIONS.filter(r => r.projectId === project.id).map(r => (
            <InsightCard
              key={r.id}
              severity={r.severity}
              title={r.title}
              description={r.description}
            />
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormGroup label="Nombre del proyecto">
              <input className="form-input" defaultValue={project.name} />
            </FormGroup>
            <FormGroup label="Descripción">
              <textarea className="form-textarea" defaultValue={project.description} rows={3} />
            </FormGroup>
            <div className="form-grid-2">
              <FormGroup label="Fecha de inicio">
                <input className="form-input" type="date" defaultValue={project.startDate} />
              </FormGroup>
              <FormGroup label="Fecha objetivo">
                <input className="form-input" type="date" defaultValue={project.targetDate} />
              </FormGroup>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                paddingTop: 8,
                borderTop: '1px solid var(--border)',
              }}
            >
              <Btn variant="secondary" size="sm">
                Cancelar
              </Btn>
              <Btn
                variant="primary"
                size="sm"
                onClick={() => addToast({ message: 'Proyecto actualizado', type: 'success' })}
              >
                Guardar cambios
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
