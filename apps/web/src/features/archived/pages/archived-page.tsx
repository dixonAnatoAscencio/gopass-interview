import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  StatusBadge, PriorityBadge, Avatar, Btn, Tabs, ConfirmModal, EmptyState, PageHeader,
} from '../../../shared/components/ui/ui-components';
import {
  ARCHIVED_PROJECTS, ARCHIVED_TASKS, getUserById, getProjectById, formatDate,
  type MockProject, type MockTask,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type ArchivedPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
};

type ConfirmState = {
  type: 'project' | 'task';
  id: string;
  name: string;
} | null;

type ArchivedProject = MockProject & {
  archivedAt: string;
  archivedBy: number;
  originalStatus: string;
  reason: string;
};

type ArchivedTask = MockTask & {
  archivedAt: string;
  archivedBy: number;
  originalStatus: string;
  reason: string;
};

export function ArchivedPage({ addToast }: ArchivedPageProps) {
  const [activeTab, setActiveTab]         = useState('projects');
  const [confirmRestore, setConfirmRestore] = useState<ConfirmState>(null);
  const [confirmDelete, setConfirmDelete]   = useState<ConfirmState>(null);
  const [archivedProjs, setArchivedProjs]   = useState<ArchivedProject[]>(
    ARCHIVED_PROJECTS as unknown as ArchivedProject[],
  );
  const [archivedTasks, setArchivedTasks]   = useState<ArchivedTask[]>(
    ARCHIVED_TASKS as unknown as ArchivedTask[],
  );

  const restoreProject = (id: string) => {
    setArchivedProjs(ps => ps.filter(p => p.id !== id));
    addToast({ message: 'Proyecto restaurado correctamente', type: 'success' });
    setConfirmRestore(null);
  };
  const deleteProject = (id: string) => {
    setArchivedProjs(ps => ps.filter(p => p.id !== id));
    addToast({ message: 'Proyecto eliminado definitivamente', type: 'info' });
    setConfirmDelete(null);
  };
  const restoreTask = (id: string) => {
    setArchivedTasks(ts => ts.filter(t => t.id !== id));
    addToast({ message: 'Tarea restaurada correctamente', type: 'success' });
    setConfirmRestore(null);
  };
  const deleteTask = (id: string) => {
    setArchivedTasks(ts => ts.filter(t => t.id !== id));
    addToast({ message: 'Tarea eliminada definitivamente', type: 'info' });
    setConfirmDelete(null);
  };

  const tabs = [
    { id: 'projects', label: 'Proyectos archivados', count: archivedProjs.length },
    { id: 'tasks',    label: 'Tareas archivadas',    count: archivedTasks.length },
  ];

  return (
    <div>
      <PageHeader
        title="Archivados"
        subtitle="Consulta o restaura proyectos y tareas archivados"
      />

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'projects' && (
        <div>
          {archivedProjs.length === 0 ? (
            <EmptyState
              icon="archive"
              title="Sin proyectos archivados"
              description="Los proyectos archivados aparecerán aquí."
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    {['Proyecto', 'Estado original', 'Archivado el', 'Archivado por', 'Motivo', 'Acciones'].map(
                      h => <th key={h}>{h}</th>,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {archivedProjs.map(p => {
                    const archivedBy = getUserById(p.archivedBy);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon name="folder" size={16} style={{ color: '#64748b' }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={p.originalStatus} />
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {formatDate(p.archivedAt)}
                          </span>
                        </td>
                        <td>
                          {archivedBy && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar user={archivedBy} size="sm" />
                              <span style={{ fontSize: 12.5 }}>
                                {archivedBy.name.split(' ')[0]}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                            {p.reason}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn
                              variant="primary"
                              size="sm"
                              icon="refresh-cw"
                              onClick={() =>
                                setConfirmRestore({ type: 'project', id: p.id, name: p.name })
                              }
                            >
                              Restaurar
                            </Btn>
                            <Btn
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmDelete({ type: 'project', id: p.id, name: p.name })
                              }
                            >
                              <Icon name="trash" size={13} />
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
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          {archivedTasks.length === 0 ? (
            <EmptyState
              icon="check-square"
              title="Sin tareas archivadas"
              description="Las tareas archivadas aparecerán aquí."
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    {['Tarea', 'Proyecto', 'Prioridad', 'Estado original', 'Archivada el', 'Por', 'Motivo', 'Acciones'].map(
                      h => <th key={h}>{h}</th>,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {archivedTasks.map(t => {
                    const proj       = getProjectById(t.projectId);
                    const archivedBy = getUserById(t.archivedBy);
                    return (
                      <tr key={t.id}>
                        <td>
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{t.title}</span>
                        </td>
                        <td>
                          {proj && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div
                                style={{ width: 7, height: 7, borderRadius: 2, background: proj.color }}
                              />
                              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                                {proj.name.slice(0, 20)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td>
                          <StatusBadge status={t.originalStatus} />
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {formatDate(t.archivedAt)}
                          </span>
                        </td>
                        <td>
                          {archivedBy && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar user={archivedBy} size="sm" />
                              <span style={{ fontSize: 12 }}>
                                {archivedBy.name.split(' ')[0]}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                            {t.reason}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn
                              variant="primary"
                              size="sm"
                              icon="refresh-cw"
                              onClick={() =>
                                setConfirmRestore({ type: 'task', id: t.id, name: t.title })
                              }
                            >
                              Restaurar
                            </Btn>
                            <Btn
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmDelete({ type: 'task', id: t.id, name: t.title })
                              }
                            >
                              <Icon name="trash" size={13} />
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
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        onConfirm={() =>
          confirmRestore?.type === 'project'
            ? restoreProject(confirmRestore.id)
            : restoreTask(confirmRestore!.id)
        }
        title="Restaurar elemento"
        message={`¿Deseas restaurar "${confirmRestore?.name}"? Volverá a estar disponible en su sección original.`}
        confirmLabel="Restaurar"
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete?.type === 'project'
            ? deleteProject(confirmDelete.id)
            : deleteTask(confirmDelete!.id)
        }
        title="Eliminar definitivamente"
        message={`¿Estás seguro de eliminar "${confirmDelete?.name}" de forma permanente? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar definitivamente"
        danger
      />
    </div>
  );
}
