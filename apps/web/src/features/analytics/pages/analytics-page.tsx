import { useState, useMemo } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  Avatar, Btn, MetricCard, PageHeader, FilterSelect,
} from '../../../shared/components/ui/ui-components';
import {
  USERS, PROJECTS, TASKS, getOverdueTasks, type MockTask,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type AnalyticsPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
};

type ChartDatum = {
  label: string;
  value: number;
  color: string;
};

type WeeklyDatum = {
  week: string;
  created: number;
  completed: number;
};

type TeamRankRow = {
  user: (typeof USERS)[number];
  assigned: number;
  done: number;
  overdue: number;
  blocked: number;
  pct: number;
};

type DonutSegment = ChartDatum & {
  pct: number;
  dash: number;
  offset: number;
};


export function AnalyticsPage({}: AnalyticsPageProps) {
  const [dateRange, setDateRange] = useState('month');
  const [projectF, setProjectF]   = useState('');
  const [assigneeF, setAssigneeF] = useState('');

  const tasks    = useMemo<MockTask[]>(
    () => (projectF ? TASKS.filter(t => t.projectId === projectF) : TASKS),
    [projectF],
  );
  const filtered = useMemo<MockTask[]>(
    () => (assigneeF ? tasks.filter(t => String(t.assigneeId) === assigneeF) : tasks),
    [tasks, assigneeF],
  );

  const done    = filtered.filter(t => t.status === 'done').length;
  const inProg  = filtered.filter(t => t.status === 'in_progress').length;
  const blocked = filtered.filter(t => t.status === 'blocked').length;
  const overdue = getOverdueTasks().filter(
    t =>
      (projectF ? t.projectId === projectF : true) &&
      (assigneeF ? String(t.assigneeId) === assigneeF : true),
  ).length;
  const totalF     = filtered.length;
  const completion = totalF > 0 ? Math.round((done / totalF) * 100) : 0;

  const statusData: ChartDatum[] = [
    { label: 'Pendiente',   value: filtered.filter(t => t.status === 'todo').length,      color: '#94a3b8' },
    { label: 'En progreso', value: inProg,                                                 color: '#6366f1' },
    { label: 'Bloqueada',   value: blocked,                                                color: '#ef4444' },
    { label: 'En revisión', value: filtered.filter(t => t.status === 'in_review').length, color: '#f59e0b' },
    { label: 'Completada',  value: done,                                                   color: '#10b981' },
  ];
  const maxStatus = Math.max(1, ...statusData.map(d => d.value));


  const weeklyData: WeeklyDatum[] = [
    { week: 'S1', created: 8, completed: 4 },
    { week: 'S2', created: 6, completed: 7 },
    { week: 'S3', created: 9, completed: 5 },
    { week: 'S4', created: 5, completed: 8 },
    { week: 'S5', created: 7, completed: 9 },
    { week: 'S6', created: 4, completed: 6 },
  ];
  const weeklyMax = Math.max(...weeklyData.flatMap(d => [d.created, d.completed]));

  const teamRanking: TeamRankRow[] = USERS.map(u => {
    const uTasks   = TASKS.filter(t => t.assigneeId === u.id);
    const uDone    = uTasks.filter(t => t.status === 'done').length;
    const uOverdue = uTasks.filter(
      t => t.status !== 'done' && new Date(t.dueDate) < new Date('2026-06-10'),
    ).length;
    const uBlocked = uTasks.filter(t => t.status === 'blocked').length;
    const pct      = uTasks.length > 0 ? Math.round((uDone / uTasks.length) * 100) : 0;
    return { user: u, assigned: uTasks.length, done: uDone, overdue: uOverdue, blocked: uBlocked, pct };
  }).sort((a, b) => b.pct - a.pct);

  const overdueByProject = PROJECTS.map(p => ({
    project: p,
    count: TASKS.filter(
      t =>
        t.projectId === p.id &&
        t.status !== 'done' &&
        new Date(t.dueDate) < new Date('2026-06-10'),
    ).length,
  })).filter(d => d.count > 0);
  const maxODP = Math.max(1, ...overdueByProject.map(d => d.count));

  const total = totalF || 1;
  const donutData = statusData.map(d => ({ ...d, pct: d.value / total }));
  const r = 36;
  const circ = 2 * Math.PI * r;
  let dashOffset = 0;
  const donutSegments: DonutSegment[] = donutData.map(d => {
    const dash = d.pct * circ;
    const seg: DonutSegment = { ...d, dash, offset: dashOffset };
    dashOffset += dash;
    return seg;
  });

  const urgentTasks  = TASKS.filter(t => t.priority === 'urgent');
  const overdueIds   = new Set(getOverdueTasks().map(o => o.id));
  const urgentODPct  = Math.round(
    (urgentTasks.filter(t => overdueIds.has(t.id)).length / Math.max(1, urgentTasks.length)) * 100,
  );

  return (
    <div>
      <PageHeader
        title="Analíticas"
        subtitle="Mide el avance, los bloqueos y el rendimiento del equipo"
      />

      <div className="card" style={{ padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              ['week', 'Esta semana'],
              ['month', 'Este mes'],
              ['quarter', 'Trimestre'],
              ['year', 'Este año'],
            ] as [string, string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setDateRange(v)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12.5,
                  fontWeight: 500,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: dateRange === v ? '#6366f1' : 'white',
                  color: dateRange === v ? 'white' : 'var(--text-secondary)',
                  border: dateRange === v ? 'none' : '1px solid var(--border)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <FilterSelect
            value={projectF}
            onChange={setProjectF}
            placeholder="Todos los proyectos"
            options={PROJECTS.map(p => ({ value: p.id, label: p.name }))}
          />
          <FilterSelect
            value={assigneeF}
            onChange={setAssigneeF}
            placeholder="Todos los responsables"
            options={USERS.map(u => ({ value: String(u.id), label: u.name }))}
          />
          {(projectF || assigneeF) && (
            <Btn
              variant="ghost"
              size="sm"
              icon="x"
              onClick={() => { setProjectF(''); setAssigneeF(''); }}
            >
              Limpiar
            </Btn>
          )}
        </div>
      </div>

      <div className="metrics-grid metrics-grid-5" style={{ marginBottom: 20 }}>
        <MetricCard
          icon="percent"
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          value={`${completion}%`}
          label="Tasa de finalización"
          change="+12% vs mes anterior"
          changeType="positive"
        />
        <MetricCard
          icon="clock"
          iconBg="#eff6ff"
          iconColor="#6366f1"
          value="3.2d"
          label="Tiempo promedio ciclo"
          subtitle="Por tarea completada"
        />
        <MetricCard
          icon="trending-up"
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          value={`${totalF}/${done}`}
          label="Creadas / Completadas"
          subtitle="En el período"
        />
        <MetricCard
          icon="alert-circle"
          iconBg="#fff5f5"
          iconColor="#dc2626"
          value={blocked}
          label="Tareas bloqueadas"
          change={blocked > 0 ? 'Revisar ahora' : undefined}
          changeType="negative"
        />
        <MetricCard
          icon="clock"
          iconBg="#fff1f2"
          iconColor="#e11d48"
          value={overdue}
          label="Tareas vencidas"
          change={overdue > 0 ? 'Requieren atención' : undefined}
          changeType="negative"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Status bar chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Tareas por estado</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {statusData.map(d => (
              <div
                key={d.label}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</span>
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(6, (d.value / maxStatus) * 78)}px`,
                    background: d.color,
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.85,
                  }}
                />
                <span
                  style={{
                    fontSize: 9.5,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    maxWidth: 54,
                  }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Distribución por estado</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              {donutSegments.map((s, i) => (
                <circle
                  key={i}
                  cx={50}
                  cy={50}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={14}
                  strokeDasharray={`${s.dash} ${circ - s.dash}`}
                  strokeDashoffset={-s.offset}
                  transform="rotate(-90 50 50)"
                  opacity={0.9}
                />
              ))}
              <text x={50} y={46} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0f172a">
                {completion}%
              </text>
              <text x={50} y={58} textAnchor="middle" fontSize={8} fill="#94a3b8">
                completado
              </text>
            </svg>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {statusData
                .filter(d => d.value > 0)
                .map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                    <div
                      style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Weekly line chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Completadas vs Creadas por semana</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 2.5, background: '#6366f1', borderRadius: 99 }} />
                Creadas
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 2.5, background: '#10b981', borderRadius: 99 }} />
                Completadas
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 80 }}>
            <svg
              width="100%"
              height={80}
              viewBox="0 0 320 80"
              preserveAspectRatio="none"
            >
              <polyline
                points={weeklyData
                  .map((d, i) => {
                    const x = (i / (weeklyData.length - 1)) * 300 + 10;
                    const y = 70 - (d.created / weeklyMax) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={weeklyData
                  .map((d, i) => {
                    const x = (i / (weeklyData.length - 1)) * 300 + 10;
                    const y = 70 - (d.completed / weeklyMax) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {weeklyData.map((d, i) => {
                const x = (i / (weeklyData.length - 1)) * 300 + 10;
                return (
                  <text key={i} x={x} y={78} textAnchor="middle" fontSize={9} fill="#94a3b8">
                    {d.week}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Overdue by project */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Vencidas por proyecto</div>
          </div>
          {overdueByProject.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Sin tareas vencidas 🎉
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdueByProject.map(({ project: p, count }) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{ width: 7, height: 7, borderRadius: 2, background: p.color, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      width: 130,
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {p.name.slice(0, 18)}
                  </span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 99 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(count / maxODP) * 100}%`,
                        background: '#ef4444',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', minWidth: 16 }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team ranking */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div
          className="card-header"
          style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
        >
          <div className="card-title">Rendimiento del equipo</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {['#', 'Responsable', 'Asignadas', 'Completadas', 'Vencidas', 'Bloqueadas', 'Cumplimiento'].map(
                  h => <th key={h}>{h}</th>,
                )}
              </tr>
            </thead>
            <tbody>
              {teamRanking.map((row, i) => (
                <tr key={row.user.id}>
                  <td>
                    {i === 0 ? (
                      <span style={{ fontSize: 16 }}>🥇</span>
                    ) : i === 1 ? (
                      <span style={{ fontSize: 16 }}>🥈</span>
                    ) : i === 2 ? (
                      <span style={{ fontSize: 16 }}>🥉</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar user={row.user} size="sm" />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{row.assigned}</span>
                  </td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{row.done}</span>
                  </td>
                  <td>
                    {row.overdue > 0 ? (
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>{row.overdue}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {row.blocked > 0 ? (
                      <span style={{ color: '#ea580c', fontWeight: 700 }}>{row.blocked}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 70, height: 6, background: 'var(--bg)', borderRadius: 99 }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${row.pct}%`,
                            background:
                              row.pct >= 70 ? '#10b981' : row.pct >= 40 ? '#f59e0b' : '#ef4444',
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color:
                            row.pct >= 70 ? '#16a34a' : row.pct >= 40 ? '#d97706' : '#dc2626',
                        }}
                      >
                        {row.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="card" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="sparkles" size={16} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#4c1d95' }}>
            Conclusiones automáticas
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            `El equipo completa en promedio ${Math.round(done / 6)} tareas por semana en el período seleccionado.`,
            `El cuello de botella principal está en "En Revisión" con ${filtered.filter(t => t.status === 'in_review').length} tareas pendientes.`,
            `Las tareas urgentes tienen mayor tasa de vencimiento (${urgentODPct}%).`,
            `${teamRanking[0]?.user.name} lidera el equipo con ${teamRanking[0]?.pct}% de cumplimiento este período.`,
          ].map((insight, i) => (
            <div
              key={i}
              style={{ display: 'flex', gap: 8, fontSize: 13, color: '#4c1d95', lineHeight: 1.5 }}
            >
              <span style={{ flexShrink: 0 }}>{(['📊', '🔍', '⚡', '🏆'] as const)[i]}</span>
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
