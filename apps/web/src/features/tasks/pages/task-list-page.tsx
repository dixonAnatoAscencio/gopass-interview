import { useState, useMemo } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  StatusBadge, PriorityBadge, Avatar, Btn, EmptyState, PageHeader,
  FilterSelect, SearchInput,
} from '../../../shared/components/ui/ui-components';
import {
  USERS, TASKS, getProjectById, getUserById, formatDate, type MockTask,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type TaskListPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
  onOpenTask: (task: MockTask) => void;
};

type SortDir = 'asc' | 'desc';

export function TaskListPage({ addToast, onOpenTask }: TaskListPageProps) {
  const [tasks, setTasks]         = useState<MockTask[]>(TASKS);
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('');
  const [priorityF, setPriorityF] = useState('');
  const [assigneeF, setAssigneeF] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [selected, setSelected]   = useState<string[]>([]);
  const [sortCol, setSortCol]     = useState('dueDate');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');

  const today = new Date('2026-06-10');

  const filtered = useMemo(() => {
    let res = [...tasks];
    if (search)      res = res.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (statusF)     res = res.filter(t => t.status === statusF);
    if (priorityF)   res = res.filter(t => t.priority === priorityF);
    if (assigneeF)   res = res.filter(t => String(t.assigneeId) === assigneeF);
    if (overdueOnly) res = res.filter(t => t.status !== 'done' && new Date(t.dueDate) < today);
    if (myTasksOnly) res = res.filter(t => t.assigneeId === 1);
    res.sort((a, b) => {
      let va: unknown = a[sortCol as keyof MockTask];
      let vb: unknown = b[sortCol as keyof MockTask];
      if (sortCol === 'dueDate') {
        va = new Date((va as string) || '9999');
        vb = new Date((vb as string) || '9999');
      }
      if (va! < vb!) return sortDir === 'asc' ? -1 : 1;
      if (va! > vb!) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return res;
  }, [tasks, search, statusF, priorityF, assigneeF, overdueOnly, myTasksOnly, sortCol, sortDir]);

  const clearFilters = () => {
    setSearch('');
    setStatusF('');
    setPriorityF('');
    setAssigneeF('');
    setOverdueOnly(false);
    setMyTasksOnly(false);
  };
  const hasFilters = search || statusF || priorityF || assigneeF || overdueOnly || myTasksOnly;

  const toggleSelect = (id: string) =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected(s => (s.length === filtered.length ? [] : filtered.map(t => t.id)));
  const allSelected = selected.length > 0 && selected.length === filtered.length;

  const bulkChangeStatus = (status: string) => {
    setTasks(ts => ts.map(t => (selected.includes(t.id) ? { ...t, status } : t)));
    addToast({ message: `${selected.length} tarea(s) actualizadas`, type: 'success' });
    setSelected([]);
  };
  const bulkArchive = () => {
    setTasks(ts => ts.map(t => (selected.includes(t.id) ? { ...t, status: 'archived' } : t)));
    addToast({ message: `${selected.length} tarea(s) archivadas`, type: 'success' });
    setSelected([]);
  };

  const sortBy = (col: string) => {
    if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col ? (
      <Icon name={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'} size={11} />
    ) : (
      <Icon name="chevron-down" size={11} style={{ opacity: 0.3 }} />
    );

  const statusBulkOptions = [
    { value: 'in_progress', label: 'En progreso' },
    { value: 'blocked',     label: 'Bloqueada' },
    { value: 'in_review',   label: 'En revisión' },
    { value: 'done',        label: 'Completada' },
  ];

  return (
    <div>
      <PageHeader
        title="Mis tareas"
        subtitle="Gestiona y filtra todas las tareas del equipo"
        actions={[
          <Btn
            key="nt"
            variant="primary"
            size="sm"
            icon="plus"
            onClick={() => addToast({ message: 'Abriendo formulario…', type: 'info' })}
          >
            Nueva tarea
          </Btn>,
        ]}
      />

      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar tarea…" />
          <FilterSelect
            value={statusF}
            onChange={setStatusF}
            placeholder="Estado"
            options={[
              { value: 'todo',        label: 'Pendiente' },
              { value: 'in_progress', label: 'En progreso' },
              { value: 'blocked',     label: 'Bloqueada' },
              { value: 'in_review',   label: 'En revisión' },
              { value: 'done',        label: 'Completada' },
            ]}
          />
          <FilterSelect
            value={priorityF}
            onChange={setPriorityF}
            placeholder="Prioridad"
            options={[
              { value: 'low',    label: 'Baja' },
              { value: 'medium', label: 'Media' },
              { value: 'high',   label: 'Alta' },
              { value: 'urgent', label: 'Urgente' },
            ]}
          />
          <FilterSelect
            value={assigneeF}
            onChange={setAssigneeF}
            placeholder="Responsable"
            options={USERS.map(u => ({ value: String(u.id), label: u.name }))}
          />
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0 4px',
              height: 32,
              whiteSpace: 'nowrap',
            }}
          >
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={e => setOverdueOnly(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
            Solo vencidas
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0 4px',
              height: 32,
              whiteSpace: 'nowrap',
            }}
          >
            <input
              type="checkbox"
              checked={myTasksOnly}
              onChange={e => setMyTasksOnly(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
            Mis tareas
          </label>
          {hasFilters && (
            <Btn variant="ghost" size="sm" icon="x" onClick={clearFilters}>
              Limpiar
            </Btn>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div
          style={{
            background: '#312e81',
            borderRadius: 10,
            padding: '10px 16px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white', marginRight: 4 }}>
            {selected.length} seleccionada(s)
          </span>
          {statusBulkOptions.map(o => (
            <button
              key={o.value}
              onClick={() => bulkChangeStatus(o.value)}
              style={{
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {o.label}
            </button>
          ))}
          <button
            onClick={bulkArchive}
            style={{
              padding: '5px 12px',
              background: 'rgba(239,68,68,0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Icon name="archive" size={12} /> Archivar
          </button>
          <button
            onClick={() => setSelected([])}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>
      )}

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>
        {filtered.length} tarea{filtered.length !== 1 ? 's' : ''} encontrada
        {filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="check-square"
          title="Sin tareas"
          description="No hay tareas que coincidan con los filtros actuales."
          action={
            <Btn variant="primary" icon="x" onClick={clearFilters}>
              Limpiar filtros
            </Btn>
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      style={{ accentColor: '#6366f1' }}
                    />
                  </th>
                  <th onClick={() => sortBy('title')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Título
                      <SortIcon col="title" />
                    </div>
                  </th>
                  <th>Proyecto</th>
                  <th onClick={() => sortBy('status')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Estado
                      <SortIcon col="status" />
                    </div>
                  </th>
                  <th onClick={() => sortBy('priority')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Prioridad
                      <SortIcon col="priority" />
                    </div>
                  </th>
                  <th>Responsable</th>
                  <th onClick={() => sortBy('dueDate')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Vence
                      <SortIcon col="dueDate" />
                    </div>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const proj     = getProjectById(t.projectId);
                  const assignee = getUserById(t.assigneeId);
                  const isOD     = t.status !== 'done' && new Date(t.dueDate) < today;
                  const isSel    = selected.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      style={{ background: isSel ? '#f5f3ff' : undefined, cursor: 'pointer' }}
                      onClick={() => onOpenTask(t)}
                    >
                      <td
                        onClick={e => {
                          e.stopPropagation();
                          toggleSelect(t.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleSelect(t.id)}
                          style={{ accentColor: '#6366f1' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {t.priority === 'urgent' && (
                            <Icon name="zap" size={13} style={{ color: '#e11d48', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>
                              {t.title}
                            </div>
                            {t.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                                {t.tags.slice(0, 2).map(tag => (
                                  <span
                                    key={tag}
                                    className="tag"
                                    style={{ padding: '1px 6px', fontSize: 10 }}
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
                              {'...' + proj.name.slice(-16)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td>
                        {assignee ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Avatar user={assignee} size="sm" />
                            <span style={{ fontSize: 12.5 }}>
                              {assignee.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-todo" style={{ fontSize: 10 }}>
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12.5,
                            color: isOD ? '#dc2626' : 'var(--text-secondary)',
                            fontWeight: isOD ? 700 : 400,
                          }}
                        >
                          {isOD && (
                            <Icon
                              name="alert-circle"
                              size={11}
                              style={{ marginRight: 3, verticalAlign: 'middle' }}
                            />
                          )}
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
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              addToast({ message: 'Tarea archivada', type: 'success' })
                            }
                          >
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
