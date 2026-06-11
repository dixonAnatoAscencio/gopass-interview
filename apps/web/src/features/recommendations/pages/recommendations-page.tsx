import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  Btn, Tabs, EmptyState, MetricCard, PageHeader,
} from '../../../shared/components/ui/ui-components';
import {
  TASKS, RECOMMENDATIONS, getProjectById, formatRelative, type MockRecommendation,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type RecommendationsPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
};

type ExtendedRec = MockRecommendation & {
  applied?: boolean;
  ignored?: boolean;
};

type TypeConfig = {
  icon: string;
  bg: string;
  color: string;
  label: string;
};

type SeverityConfig = {
  bg: string;
  color: string;
  label: string;
};

const typeConfig: Record<string, TypeConfig> = {
  overdue:    { icon: 'clock',          bg: '#fff1f2', color: '#e11d48', label: 'Vencidas' },
  blocked:    { icon: 'alert-circle',   bg: '#fff5f5', color: '#dc2626', label: 'Bloqueadas' },
  unassigned: { icon: 'user',           bg: '#fffbeb', color: '#d97706', label: 'Sin asignar' },
  inactive:   { icon: 'activity',       bg: '#f0f9ff', color: '#0891b2', label: 'Sin actividad' },
  ai:         { icon: 'sparkles',       bg: '#f5f3ff', color: '#7c3aed', label: 'Sugerencia IA' },
  risk:       { icon: 'alert-triangle', bg: '#fff7ed', color: '#ea580c', label: 'En riesgo' },
};

const severityConfig: Record<string, SeverityConfig> = {
  critical: { bg: '#fee2e2', color: '#dc2626', label: 'Crítica' },
  high:     { bg: '#fff7ed', color: '#ea580c', label: 'Alta' },
  medium:   { bg: '#fffbeb', color: '#d97706', label: 'Media' },
  low:      { bg: '#f0fdf4', color: '#16a34a', label: 'Baja' },
};

export function RecommendationsPage({ addToast }: RecommendationsPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [recs, setRecs]           = useState<ExtendedRec[]>(
    RECOMMENDATIONS.map(r => ({ ...r, applied: false, ignored: false })),
  );

  const apply = (id: string) => {
    setRecs(rs => rs.map(r => (r.id === id ? { ...r, applied: true, ignored: false } : r)));
    addToast({ message: 'Recomendación aplicada', type: 'success' });
  };
  const ignore = (id: string) => {
    setRecs(rs => rs.map(r => (r.id === id ? { ...r, ignored: true } : r)));
    addToast({ message: 'Recomendación ignorada', type: 'info' });
  };
  const restore = (id: string) => {
    setRecs(rs => rs.map(r => (r.id === id ? { ...r, ignored: false, applied: false } : r)));
  };

  const tabDefs = [
    { id: 'all',         label: 'Todas',      count: recs.filter(r => !r.ignored).length },
    { id: 'critical',    label: 'Críticas',   count: recs.filter(r => r.severity === 'critical' && !r.ignored).length },
    { id: 'operational', label: 'Operativas', count: recs.filter(r => ['high', 'medium'].includes(r.severity) && r.type !== 'ai' && !r.ignored).length },
    { id: 'ai',          label: 'IA',         count: recs.filter(r => r.type === 'ai' && !r.ignored).length },
    { id: 'ignored',     label: 'Ignoradas',  count: recs.filter(r => r.ignored).length },
  ];

  const visible = recs.filter(r => {
    if (activeTab === 'all')         return !r.ignored && !r.applied;
    if (activeTab === 'critical')    return r.severity === 'critical' && !r.ignored && !r.applied;
    if (activeTab === 'operational') return ['high', 'medium'].includes(r.severity) && r.type !== 'ai' && !r.ignored && !r.applied;
    if (activeTab === 'ai')          return r.type === 'ai' && !r.ignored && !r.applied;
    if (activeTab === 'ignored')     return r.ignored;
    return true;
  });

  const applied = recs.filter(r => r.applied);

  return (
    <div>
      <PageHeader
        title="Recomendaciones"
        subtitle="Alertas inteligentes basadas en el estado de tus proyectos y tareas"
        actions={[
          <Btn
            key="r"
            variant="secondary"
            size="sm"
            icon="refresh-cw"
            onClick={() => addToast({ message: 'Recomendaciones actualizadas', type: 'info' })}
          >
            Actualizar
          </Btn>,
        ]}
      />

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}
      >
        <MetricCard
          icon="alert-circle"
          iconBg="#fff1f2"
          iconColor="#e11d48"
          value={recs.filter(r => r.severity === 'critical' && !r.ignored).length}
          label="Críticas"
          subtitle="Acción inmediata"
        />
        <MetricCard
          icon="alert-triangle"
          iconBg="#fff7ed"
          iconColor="#ea580c"
          value={recs.filter(r => r.severity === 'high' && !r.ignored).length}
          label="Alta prioridad"
          subtitle="Esta semana"
        />
        <MetricCard
          icon="check-circle"
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          value={applied.length}
          label="Aplicadas"
          subtitle="Este período"
          changeType="positive"
        />
        <MetricCard
          icon="sparkles"
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          value={recs.filter(r => r.type === 'ai' && !r.ignored).length}
          label="Sugerencias IA"
          subtitle="Pendientes de revisión"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={tabDefs} active={activeTab} onChange={setActiveTab} />
      </div>

      {visible.length === 0 && (
        <EmptyState
          icon={activeTab === 'ignored' ? 'archive' : 'check-circle'}
          title={activeTab === 'ignored' ? 'Sin recomendaciones ignoradas' : '¡Todo en orden!'}
          description={
            activeTab === 'ignored'
              ? 'No has ignorado ninguna recomendación.'
              : 'No hay recomendaciones activas en esta categoría.'
          }
        />
      )}

      {visible.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(r => {
            const tc   = typeConfig[r.type] ?? typeConfig['risk'];
            const sc   = severityConfig[r.severity] ?? severityConfig['low'];
            const proj = r.projectId ? getProjectById(r.projectId) : null;
            const task = r.taskId ? TASKS.find(t => t.id === r.taskId) : null;
            return (
              <div
                key={r.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', opacity: r.ignored ? 0.6 : 1 }}
              >
                <div style={{ height: 3, background: sc.color }} />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: tc.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={tc.icon} size={18} style={{ color: tc.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: tc.bg,
                                color: tc.color,
                              }}
                            >
                              {tc.label}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: sc.bg,
                                color: sc.color,
                              }}
                            >
                              {sc.label}
                            </span>
                            {r.type === 'ai' && (
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: '2px 6px',
                                  borderRadius: 99,
                                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                  color: 'white',
                                  fontWeight: 700,
                                }}
                              >
                                ✨ IA
                              </span>
                            )}
                          </div>
                          <h3
                            style={{
                              fontSize: 14.5,
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                            }}
                          >
                            {r.title}
                          </h3>
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          marginBottom: 12,
                        }}
                      >
                        {r.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        {proj && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--text-muted)',
                            }}
                          >
                            <div
                              style={{ width: 7, height: 7, borderRadius: 2, background: proj.color }}
                            />
                            {proj.name}
                          </div>
                        )}
                        {task && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--text-muted)',
                            }}
                          >
                            <Icon name="check-square" size={11} />
                            {task.title.slice(0, 32) + (task.title.length > 32 ? '…' : '')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!r.ignored && (
                          <Btn variant="primary" size="sm" icon="check" onClick={() => apply(r.id)}>
                            Aplicar
                          </Btn>
                        )}
                        {!r.ignored && (
                          <Btn variant="ghost" size="sm" onClick={() => ignore(r.id)}>
                            Ignorar
                          </Btn>
                        )}
                        {r.ignored && (
                          <Btn
                            variant="ghost"
                            size="sm"
                            icon="refresh-cw"
                            onClick={() => restore(r.id)}
                          >
                            Restaurar
                          </Btn>
                        )}
                        <Btn variant="secondary" size="sm" icon="external-link" onClick={() => {}}>
                          Ver detalle
                        </Btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {applied.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 12,
            }}
          >
            {applied.length} Aplicada{applied.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applied.map(r => (
              <div
                key={r.id}
                style={{
                  padding: '12px 16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Icon name="check-circle" size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{r.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a' }}>
                  Aplicada · {formatRelative('2026-06-10T10:00:00Z')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
