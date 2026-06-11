import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  Avatar, Btn, Modal, FormGroup,
} from '../../../shared/components/ui/ui-components';
import { USERS, PROJECTS } from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

// ── New Project Modal ─────────────────────────────────────────────────────────

interface ProjectForm {
  name: string;
  description: string;
  ownerId: string;
  startDate: string;
  targetDate: string;
  members: number[];
  status: string;
  color: string;
}

const INITIAL_PROJECT_FORM: ProjectForm = {
  name: '', description: '', ownerId: '', startDate: '', targetDate: '',
  members: [], status: 'active', color: '#6366f1',
};

const COLORS = ['#6366f1','#0891b2','#059669','#d97706','#dc2626','#8b5cf6','#ec4899','#10b981'];

export function NewProjectModal({ isOpen, onClose, addToast }: { isOpen: boolean; onClose: () => void; addToast: AddToast }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState<ProjectForm>(INITIAL_PROJECT_FORM);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const set = (k: keyof ProjectForm, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const toggleMember = (id: number) =>
    set('members', form.members.includes(id) ? form.members.filter(x => x !== id) : [...form.members, id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name       = 'El nombre es requerido';
    if (!form.ownerId)       e.ownerId    = 'Selecciona un responsable';
    if (!form.startDate)     e.startDate  = 'Selecciona fecha de inicio';
    if (!form.targetDate)    e.targetDate = 'Selecciona fecha objetivo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      addToast({ message: `Proyecto "${form.name}" creado correctamente`, type: 'success' });
      setForm(INITIAL_PROJECT_FORM);
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo proyecto"
      size="lg"
      footer={
        <>
          <Btn variant="secondary" size="sm" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: 99, animation: 'spin 0.6s linear infinite' }} />
                Guardando…
              </div>
            ) : 'Crear proyecto'}
          </Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Name */}
        <FormGroup label="Nombre del proyecto" required>
          <input
            className="form-input"
            placeholder="Ej: Portal de Clientes"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            style={errors.name ? { borderColor: '#ef4444' } : {}}
          />
          {errors.name && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.name}</span>}
        </FormGroup>

        {/* Description */}
        <FormGroup label="Descripción">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Describe el objetivo del proyecto…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </FormGroup>

        {/* Dates */}
        <div className="form-grid-2">
          <FormGroup label="Fecha de inicio" required>
            <input
              className="form-input"
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              style={errors.startDate ? { borderColor: '#ef4444' } : {}}
            />
            {errors.startDate && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.startDate}</span>}
          </FormGroup>
          <FormGroup label="Fecha objetivo" required>
            <input
              className="form-input"
              type="date"
              value={form.targetDate}
              onChange={e => set('targetDate', e.target.value)}
              style={errors.targetDate ? { borderColor: '#ef4444' } : {}}
            />
            {errors.targetDate && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.targetDate}</span>}
          </FormGroup>
        </div>

        {/* Owner + Status */}
        <div className="form-grid-2">
          <FormGroup label="Responsable" required>
            <select
              className="form-select"
              value={form.ownerId}
              onChange={e => set('ownerId', e.target.value)}
              style={errors.ownerId ? { borderColor: '#ef4444' } : {}}
            >
              <option value="">Seleccionar responsable</option>
              {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {errors.ownerId && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.ownerId}</span>}
          </FormGroup>
          <FormGroup label="Estado inicial">
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Activo</option>
              <option value="in_progress">En progreso</option>
            </select>
          </FormGroup>
        </div>

        {/* Members */}
        <FormGroup label="Miembros del equipo">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {USERS.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleMember(u.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 10px', borderRadius: 8, border: '1.5px solid',
                  borderColor: form.members.includes(u.id) ? u.color : 'var(--border)',
                  background: form.members.includes(u.id) ? u.color + '15' : 'white',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Avatar user={u} size="sm" />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: form.members.includes(u.id) ? u.color : 'var(--text-secondary)' }}>
                  {u.name.split(' ')[0]}
                </span>
                {form.members.includes(u.id) && <Icon name="check" size={11} style={{ color: u.color }} />}
              </button>
            ))}
          </div>
        </FormGroup>

        {/* Color */}
        <FormGroup label="Color identificador">
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                style={{
                  width: 28, height: 28, borderRadius: 7, background: c,
                  border: `3px solid ${form.color === c ? '#0f172a' : 'transparent'}`,
                  cursor: 'pointer', transition: 'transform 0.1s',
                  transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── New Task Modal ────────────────────────────────────────────────────────────

interface TaskForm {
  title: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  assigneeId: string;
  dueDate: string;
  labels: string[];
  checklistItems: string[];
  comment: string;
}

const makeInitialTaskForm = (defaultProjectId?: string): TaskForm => ({
  title: '', description: '', projectId: defaultProjectId ?? '',
  status: 'todo', priority: 'medium', assigneeId: '',
  dueDate: '', labels: [], checklistItems: [''], comment: '',
});

export function NewTaskModal({ isOpen, onClose, addToast, defaultProjectId }: {
  isOpen: boolean;
  onClose: () => void;
  addToast: AddToast;
  defaultProjectId?: string;
}) {
  const [loading,       setLoading]       = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [form,          setForm]          = useState<TaskForm>(() => makeInitialTaskForm(defaultProjectId));
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  const set = (k: keyof TaskForm, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title     = 'El título es requerido';
    if (!form.projectId)    e.projectId = 'Selecciona un proyecto';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (createAnother = false) => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!createAnother) onClose();
      addToast({ message: `Tarea "${form.title}" creada correctamente`, type: 'success' });
      setForm(makeInitialTaskForm(defaultProjectId));
    }, 700);
  };

  const sections = [
    { id: 'basic',     label: 'Información' },
    { id: 'planning',  label: 'Planificación' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'advanced',  label: 'Avanzado' },
  ];

  const addCheckItem    = () => set('checklistItems', [...form.checklistItems, '']);
  const setCheckItem    = (i: number, v: string) => { const c = [...form.checklistItems]; c[i] = v; set('checklistItems', c); };
  const removeCheckItem = (i: number) => set('checklistItems', form.checklistItems.filter((_, idx) => idx !== i));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva tarea"
      size="lg"
      footer={
        <>
          <Btn variant="secondary" size="sm" onClick={onClose}>Cancelar</Btn>
          <Btn variant="secondary" size="sm" onClick={() => handleSubmit(true)} disabled={loading}>Guardar y crear otra</Btn>
          <Btn variant="primary" size="sm" onClick={() => handleSubmit(false)} disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: 99, animation: 'spin 0.6s linear infinite' }} />
                Guardando…
              </div>
            ) : 'Guardar tarea'}
          </Btn>
        </>
      }
    >
      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '8px 14px', fontSize: 13,
              fontWeight: activeSection === s.id ? 700 : 500,
              color: activeSection === s.id ? '#6366f1' : 'var(--text-muted)',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${activeSection === s.id ? '#6366f1' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* BASIC section */}
        {activeSection === 'basic' && (
          <>
            <FormGroup label="Título" required>
              <input
                className="form-input"
                placeholder="Describe brevemente la tarea…"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                style={errors.title ? { borderColor: '#ef4444' } : {}}
              />
              {errors.title && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.title}</span>}
            </FormGroup>
            <FormGroup label="Descripción">
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Detalla el contexto, criterios de aceptación o notas relevantes…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </FormGroup>
            <div className="form-grid-2">
              <FormGroup label="Proyecto" required>
                <select
                  className="form-select"
                  value={form.projectId}
                  onChange={e => set('projectId', e.target.value)}
                  style={errors.projectId ? { borderColor: '#ef4444' } : {}}
                >
                  <option value="">Seleccionar proyecto</option>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.projectId && <span style={{ fontSize: 11.5, color: '#dc2626' }}>{errors.projectId}</span>}
              </FormGroup>
              <FormGroup label="Estado">
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {[['todo','Pendiente'],['in_progress','En progreso'],['blocked','Bloqueada'],['in_review','En revisión']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </FormGroup>
            </div>
          </>
        )}

        {/* PLANNING section */}
        {activeSection === 'planning' && (
          <>
            <div className="form-grid-2">
              <FormGroup label="Prioridad">
                <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {[['low','Baja'],['medium','Media'],['high','Alta'],['urgent','Urgente']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup label="Responsable">
                <select className="form-select" value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
                  <option value="">Sin asignar</option>
                  {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </FormGroup>
            </div>
            <FormGroup label="Fecha de vencimiento">
              <input
                className="form-input"
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
              />
            </FormGroup>
          </>
        )}

        {/* CHECKLIST section */}
        {activeSection === 'checklist' && (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>
              Agrega subtareas para dividir el trabajo en pasos más pequeños.
            </div>
            {form.checklistItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--border)', marginTop: 10, flexShrink: 0 }} />
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder={`Subtarea ${i + 1}…`}
                  value={item}
                  onChange={e => setCheckItem(i, e.target.value)}
                />
                {form.checklistItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCheckItem(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginTop: 4 }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            ))}
            <Btn variant="ghost" size="sm" icon="plus" onClick={addCheckItem}>Agregar subtarea</Btn>
          </>
        )}

        {/* ADVANCED section */}
        {activeSection === 'advanced' && (
          <>
            <FormGroup label="Comentario inicial">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Agrega contexto inicial o notas para el equipo…"
                value={form.comment}
                onChange={e => set('comment', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Etiquetas">
              <input
                className="form-input"
                placeholder="Ej: frontend, api, bug (separadas por comas)"
                value={form.labels.join(', ')}
                onChange={e => set('labels', e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
              />
            </FormGroup>
          </>
        )}
      </div>
    </Modal>
  );
}
