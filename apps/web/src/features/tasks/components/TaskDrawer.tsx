import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  StatusBadge, PriorityBadge, Avatar, Btn, Tabs, ProgressBar, EmptyState, Drawer,
} from '../../../shared/components/ui/ui-components';
import {
  USERS, COMMENTS, getUserById, getProjectById, getDaysOverdue, formatDate, formatRelative,
  getStatusLabel, getPriorityLabel, type MockTask,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

interface TaskDrawerProps {
  task: MockTask | null;
  onClose: () => void;
  addToast: AddToast;
}

export function TaskDrawer({ task: initialTask, onClose, addToast }: TaskDrawerProps) {
  const [task,       setTask]       = useState<MockTask | null>(initialTask);
  const [checklist,  setChecklist]  = useState(initialTask?.checklist ?? []);
  const [newComment, setNewComment] = useState('');
  const [aiOpen,     setAiOpen]     = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResult,   setAiResult]   = useState<{
    subtasks: string[];
    risks: string[];
    criteria: string[];
    priority: string;
    priorityReason: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const project   = getProjectById(task.projectId);
  const assignee  = getUserById(task.assigneeId);
  const creator   = getUserById(task.creatorId);
  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date('2026-06-10');
  const taskComments = COMMENTS[task.id] ?? [];

  const toggleCheck = (id: string) => {
    const updated = checklist.map(c => c.id === id ? { ...c, done: !c.done } : c);
    setChecklist(updated);
    setTask(t => t ? { ...t, checklist: updated } : t);
  };

  const changeStatus = (status: string) => {
    setTask(t => t ? { ...t, status } : t);
    addToast({ message: `Estado cambiado a "${getStatusLabel(status)}"`, type: 'success' });
  };

  const changePriority = (priority: string) => {
    setTask(t => t ? { ...t, priority } : t);
    addToast({ message: `Prioridad cambiada a "${getPriorityLabel(priority)}"`, type: 'success' });
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    setNewComment('');
    addToast({ message: 'Comentario agregado', type: 'success' });
  };

  const generateAI = () => {
    setAiLoading(true);
    setAiOpen(true);
    setTimeout(() => {
      setAiResult({
        subtasks:  ['Revisar documentación de la API', 'Configurar entorno de pruebas', 'Implementar adaptador base', 'Escribir tests de integración', 'Documentar endpoints'],
        risks:     ['Dependencia de un proveedor externo sin SLA definido', 'Rate limiting puede afectar el rendimiento en producción', 'Costo variable según volumen de llamadas'],
        criteria:  ['API responde en menos de 2s bajo carga normal', 'Manejo correcto de errores y timeouts', 'Logs estructurados en todas las llamadas', 'Cobertura de tests > 80%'],
        priority:  'urgent',
        priorityReason: 'Bloquea al menos 2 tareas dependientes y está en ruta crítica del proyecto.',
      });
      setAiLoading(false);
    }, 1400);
  };

  const tabs = [
    { id: 'details',   label: 'Detalles' },
    { id: 'checklist', label: 'Checklist',   count: checklist.length },
    { id: 'comments',  label: 'Comentarios', count: taskComments.length },
    { id: 'history',   label: 'Historial' },
  ];

  const donePct = checklist.length > 0
    ? Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)
    : 0;

  return (
    <Drawer isOpen onClose={onClose}>
      {/* Header */}
      <div className="drawer-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {isOverdue && (
              <span className="badge badge-blocked" style={{ fontSize: 10 }}>
                Vencida hace {getDaysOverdue(task.dueDate)}d
              </span>
            )}
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {task.title}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '0 6px' }}>
            <Icon name="edit" size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '0 6px' }}>
            <Icon name="more-vertical" size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 6px' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingLeft: 20 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Body */}
      <div className="drawer-body">

        {/* ── DETAILS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick actions */}
            <div className="card" style={{ padding: '14px 16px', background: 'var(--bg)', border: 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Cambio rápido
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>Estado</label>
                  <select
                    className="form-select"
                    style={{ height: 32, fontSize: 12.5 }}
                    value={task.status}
                    onChange={e => changeStatus(e.target.value)}
                  >
                    {[['todo','Pendiente'],['in_progress','En progreso'],['blocked','Bloqueada'],['in_review','En revisión'],['done','Completada']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>Prioridad</label>
                  <select
                    className="form-select"
                    style={{ height: 32, fontSize: 12.5 }}
                    value={task.priority}
                    onChange={e => changePriority(e.target.value)}
                  >
                    {[['low','Baja'],['medium','Media'],['high','Alta'],['urgent','Urgente']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>Responsable</label>
                  <select
                    className="form-select"
                    style={{ height: 32, fontSize: 12.5 }}
                    value={task.assigneeId ?? ''}
                    onChange={e => setTask(t => t ? { ...t, assigneeId: Number(e.target.value) || null } : t)}
                  >
                    <option value="">Sin asignar</option>
                    {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                { label: 'Proyecto',       value: project?.name ?? '—',       icon: 'folder' },
                { label: 'Creado por',     value: creator?.name ?? '—',       icon: 'user' },
                { label: 'Fecha creación', value: formatDate(task.createdAt),  icon: 'calendar' },
                { label: 'Fecha límite',   value: formatDate(task.dueDate),    icon: 'clock' },
                task.completedAt ? { label: 'Completada', value: formatDate(task.completedAt), icon: 'check-circle' } : null,
              ] as const).filter(Boolean).map(item => (
                <div key={item!.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {item!.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    <Icon name={item!.icon} size={12} style={{ color: 'var(--text-muted)' }} />
                    {item!.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Descripción
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{task.description}</p>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Etiquetas
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {task.tags.map(tag => (
                    <span key={tag} className="tag">
                      <Icon name="tag" size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI recommendations */}
            <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', borderRadius: 12, padding: 16, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Recomendaciones
              </div>
              {([
                isOverdue                           && `Esta tarea está vencida hace ${getDaysOverdue(task.dueDate)} día(s)`,
                task.priority === 'urgent' && !task.assigneeId && 'La prioridad es urgente y aún no tiene responsable',
                task.checklist.length === 0         && 'Considera agregar subtareas para mejor seguimiento',
                task.status === 'blocked'           && 'Esta tarea está bloqueada — requiere acción para desbloquear',
              ] as (string | false)[]).filter(Boolean).map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 99, background: '#7c3aed', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: '#4c1d95', lineHeight: 1.5 }}>{msg as string}</span>
                </div>
              ))}
              <button
                onClick={generateAI}
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Icon name="sparkles" size={13} />
                Generar sugerencias con IA
              </button>
            </div>

            {/* AI results panel */}
            {aiOpen && (
              <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#6366f1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="sparkles" size={14} style={{ color: 'white' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Resultado de análisis IA</span>
                  <button
                    onClick={() => setAiOpen(false)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
                {aiLoading ? (
                  <div style={{ padding: 20, display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: 99, animation: 'spin 0.6s linear infinite' }} />
                    Analizando tarea…
                  </div>
                ) : aiResult && (
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { title: 'Subtareas sugeridas',       icon: 'check-square',   items: aiResult.subtasks },
                      { title: 'Riesgos detectados',        icon: 'alert-triangle', items: aiResult.risks },
                      { title: 'Criterios de aceptación',   icon: 'target',         items: aiResult.criteria },
                    ].map(section => (
                      <div key={section.title}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Icon name={section.icon} size={12} /> {section.title}
                        </div>
                        {section.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <div style={{ width: 4, height: 4, borderRadius: 99, background: '#6366f1', marginTop: 5, flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div style={{ padding: 10, background: '#fffbeb', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Icon name="zap" size={13} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>
                        <strong>Prioridad recomendada: </strong>{aiResult.priority.toUpperCase()} — {aiResult.priorityReason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CHECKLIST TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'checklist' && (
          <div>
            {checklist.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>{checklist.filter(c => c.done).length} de {checklist.length} completadas</span>
                  <span style={{ fontWeight: 700 }}>{donePct}%</span>
                </div>
                <ProgressBar value={donePct} />
              </div>
            )}
            {checklist.length === 0 ? (
              <EmptyState icon="check-square" title="Sin subtareas" description="Agrega subtareas para dividir esta tarea en pasos más pequeños." />
            ) : (
              <div>
                {checklist.map(item => (
                  <div key={item.id} className="checklist-item">
                    <div
                      className={`checklist-checkbox${item.done ? ' checked' : ''}`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      {item.done && <Icon name="check" size={10} style={{ color: 'white' }} />}
                    </div>
                    <span style={{ flex: 1, fontSize: 13.5, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMMENTS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {taskComments.length === 0 && (
              <EmptyState icon="message-square" title="Sin comentarios" description="Sé el primero en comentar esta tarea." />
            )}
            {taskComments.map(c => {
              const u = getUserById(c.userId);
              return (
                <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                  <Avatar user={u} size="sm" />
                  <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{u?.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelative(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Avatar user={getUserById(1)} size="sm" />
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Escribe un comentario…"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <Btn variant="primary" size="sm" onClick={submitComment}>Comentar</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="timeline">
            {[
              { icon: 'refresh-cw',  bg: '#eff6ff', color: '#2563eb', text: 'Estado cambiado de Pendiente a En progreso',     meta: 'Laura Méndez · hace 2d' },
              { icon: 'zap',         bg: '#fff1f2', color: '#e11d48', text: 'Prioridad cambiada de Media a Alta',              meta: 'Dixon Anato · hace 4d' },
              { icon: 'user',        bg: '#f0fdf4', color: '#16a34a', text: `Responsable asignado: ${assignee?.name ?? 'N/A'}`,meta: 'Laura Méndez · hace 5d' },
              { icon: 'calendar',    bg: '#fffbeb', color: '#d97706', text: 'Fecha de vencimiento modificada',                 meta: 'Carlos Rojas · hace 7d' },
              { icon: 'plus-circle', bg: '#f5f3ff', color: '#7c3aed', text: 'Tarea creada',                                    meta: `${creator?.name} · ${formatDate(task.createdAt)}` },
            ].map((e, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: e.bg, color: e.color, width: 28, height: 28 }}>
                  <Icon name={e.icon} size={12} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title" style={{ fontSize: 12.5 }}>{e.text}</div>
                  <div className="timeline-meta">{e.meta}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
