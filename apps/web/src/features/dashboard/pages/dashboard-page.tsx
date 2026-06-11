import { useState, useMemo } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  RiskBadge, ProgressBar, Btn, MetricCard, PageHeader, InsightCard, Skeleton,
} from '../../../shared/components/ui/ui-components';
import {
  PROJECTS, TASKS, ACTIVITIES, RECOMMENDATIONS, getUserById, getProjectById,
  getOverdueTasks, formatRelative,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';
import { useGlobalSummary } from '../../analytics/hooks/use-analytics';

type DashboardPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
  onNewTask: () => void;
  onNewProject: () => void;
};

type TasksByStatus = {
  todo: number;
  in_progress: number;
  blocked: number;
  in_review: number;
  done: number;
};

type ChartDatum = {
  label: string;
  value: number;
  color: string;
};

type ActivityIconConfig = {
  icon: string;
  bg: string;
  color: string;
};

type ActivityIconMap = Record<string, ActivityIconConfig>;

export function DashboardPage({ navigate, onNewTask, onNewProject }: DashboardPageProps) {
  const [ignoredInsights, setIgnoredInsights] = useState<string[]>([]);

  // Datos reales del API
  const { data: summary, isLoading: summaryLoading } = useGlobalSummary();

  // Fallback a mock data si el API no responde
  const overdueTasks     = useMemo(() => getOverdueTasks(), []);
  const atRiskProjects   = useMemo(() => PROJECTS.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium'), []);
  const mockCompletionRate = useMemo(() => {
    const done = TASKS.filter(t => t.status === 'done').length;
    return Math.round((done / TASKS.length) * 100);
  }, []);
  const completionRate = summary?.completionRate ?? mockCompletionRate;

  const tasksByStatus = useMemo<TasksByStatus>(() => {
    const groups: TasksByStatus = { todo: 0, in_progress: 0, blocked: 0, in_review: 0, done: 0 };
    TASKS.forEach(t => {
      if (t.status in groups) groups[t.status as keyof TasksByStatus]++;
    });
    return groups;
  }, []);

  const visibleInsights = RECOMMENDATIONS.filter(r => !ignoredInsights.includes(r.id));

  const chartData: ChartDatum[] = [
    { label: 'Pendientes',  value: tasksByStatus.todo,        color: '#94a3b8' },
    { label: 'En progreso', value: tasksByStatus.in_progress, color: '#6366f1' },
    { label: 'Bloqueadas',  value: tasksByStatus.blocked,     color: '#ef4444' },
    { label: 'En revisión', value: tasksByStatus.in_review,   color: '#f59e0b' },
    { label: 'Completadas', value: tasksByStatus.done,        color: '#10b981' },
  ];
  const chartMax = Math.max(...chartData.map(d => d.value));

  const activityIcons: ActivityIconMap = {
    task_completed:   { icon: 'check-circle',   bg: '#f0fdf4', color: '#16a34a' },
    status_changed:   { icon: 'refresh-cw',     bg: '#eff6ff', color: '#2563eb' },
    task_created:     { icon: 'plus-circle',    bg: '#f5f3ff', color: '#7c3aed' },
    comment_added:    { icon: 'message-square', bg: '#fffbeb', color: '#d97706' },
    priority_changed: { icon: 'zap',            bg: '#fff1f2', color: '#e11d48' },
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de proyectos, tareas y riesgos"
        actions={[
          <Btn key="nt" variant="secondary" size="sm" icon="plus" onClick={onNewTask}>
            Nueva tarea
          </Btn>,
          <Btn key="np" variant="primary" size="sm" icon="plus" onClick={onNewProject}>
            Nuevo proyecto
          </Btn>,
        ]}
      />

      <div className="metrics-grid metrics-grid-5" style={{ marginBottom: 24 }}>
        {summaryLoading ? (
          Array.from({length:5}).map((_,i) => (
            <div key={i} className="metric-card"><Skeleton height={80} /></div>
          ))
        ) : (
          <>
            <MetricCard
              icon="folder" iconBg="#eff6ff" iconColor="#6366f1"
              value={summary?.totalProjects ?? PROJECTS.filter(p => p.status !== 'archived').length}
              label="Proyectos activos" change="+1 este mes" changeType="positive"
            />
            <MetricCard
              icon="check-square" iconBg="#f5f3ff" iconColor="#7c3aed"
              value={summary?.byStatus?.['TODO'] ?? tasksByStatus.todo}
              label="Tareas pendientes" change="3 nuevas hoy" changeType="neutral"
            />
            <MetricCard
              icon="activity" iconBg="#eff6ff" iconColor="#2563eb"
              value={summary?.byStatus?.['IN_PROGRESS'] ?? tasksByStatus.in_progress}
              label="En progreso" change="+2 esta semana" changeType="positive"
            />
            <MetricCard
              icon="clock" iconBg="#fff1f2" iconColor="#e11d48"
              value={summary?.overdueTasks ?? overdueTasks.length}
              label="Tareas vencidas" change="Requieren atención" changeType="negative"
            />
            <MetricCard
              icon="percent" iconBg="#f0fdf4" iconColor="#16a34a"
              value={`${completionRate}%`}
              label="Tasa de finalización" change="+12% esta semana" changeType="positive"
            />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="card-header"
              style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <div className="card-title">Proyectos en riesgo</div>
                <div className="card-subtitle">Proyectos que requieren atención inmediata</div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => navigate('projects')}>
                Ver todos
              </Btn>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {['Proyecto', 'Progreso', 'Vencidas', 'Bloqueadas', 'Riesgo', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRiskProjects.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 3,
                              background: p.color,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {p.completedTasks}/{p.totalTasks} tareas
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ width: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProgressBar value={p.progress} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              minWidth: 32,
                            }}
                          >
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {p.overdueTasks > 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>
                            {p.overdueTasks}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {p.blockedTasks > 0 ? (
                          <span style={{ color: '#ea580c', fontWeight: 700, fontSize: 13 }}>
                            {p.blockedTasks}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <RiskBadge level={p.riskLevel} />
                      </td>
                      <td>
                        <Btn variant="ghost" size="sm" onClick={() => navigate('project-detail')}>
                          Ver detalle
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Distribución de tareas por estado</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {TASKS.length} tareas totales
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
              {chartData.map(d => (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</div>
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      background: d.color,
                      height: `${Math.max(8, (d.value / chartMax) * 72)}px`,
                      transition: 'height 0.3s',
                      opacity: 0.85,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 56,
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 16px 12px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="sparkles" size={14} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Insights inteligentes</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {visibleInsights.length} activos
                </div>
              </div>
            </div>
            <div
              style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {visibleInsights.slice(0, 4).map(r => (
                <InsightCard
                  key={r.id}
                  severity={r.severity}
                  title={r.title}
                  description={r.description}
                  onApply={() => {}}
                  onIgnore={() => setIgnoredInsights(p => [...p, r.id])}
                />
              ))}
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => navigate('recommendations')}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                Ver todas las recomendaciones
              </Btn>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="card-header"
              style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}
            >
              <div className="card-title">Actividad reciente</div>
            </div>
            <div style={{ padding: '8px 14px 14px' }}>
              <div className="timeline">
                {ACTIVITIES.map(a => {
                  const user = getUserById(a.userId);
                  const proj = getProjectById(a.projectId);
                  const cfg = activityIcons[a.type] ?? activityIcons['task_created'];
                  return (
                    <div key={a.id} className="timeline-item">
                      <div
                        className="timeline-dot"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <Icon name={cfg.icon} size={13} />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">
                          <strong>{user?.name}</strong>
                          {` ${a.action} `}
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {a.entity}
                          </span>
                        </div>
                        <div className="timeline-meta">
                          {proj?.name ?? ''} · {formatRelative(a.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
