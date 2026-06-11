import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  PriorityBadge, Avatar,
} from '../../../shared/components/ui/ui-components';
import {
  TASKS, getUserById, getTasksByProject, getDaysOverdue, formatDate, type MockTask,
} from '../../../mock-data';

type TaskBoardPageProps = {
  projectId?: string;
  onOpenTask: (task: MockTask) => void;
};

type Column = {
  id: string;
  label: string;
  color: string;
  bg: string;
};

const COLUMNS: Column[] = [
  { id: 'todo',        label: 'Pendiente',   color: '#94a3b8', bg: '#f8fafc' },
  { id: 'in_progress', label: 'En progreso', color: '#6366f1', bg: '#eff6ff' },
  { id: 'blocked',     label: 'Bloqueada',   color: '#ef4444', bg: '#fff5f5' },
  { id: 'in_review',   label: 'En revisión', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'done',        label: 'Completada',  color: '#10b981', bg: '#f0fdf4' },
];

type KanbanCardProps = {
  task: MockTask;
  onOpen: (task: MockTask) => void;
  isDragging: boolean;
};

export function KanbanCard({ task, onOpen, isDragging }: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const assignee = getUserById(task.assigneeId);
  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date('2026-06-10');
  const doneChecks  = task.checklist.filter(c => c.done).length;
  const totalChecks = task.checklist.length;

  const cardCls = [
    'kanban-card',
    task.status === 'blocked'  ? 'is-blocked'  : '',
    task.priority === 'urgent' ? 'is-urgent'   : '',
    isOverdue                  ? 'is-overdue'  : '',
    isDragging                 ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardCls}
      onClick={() => onOpen(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={isDragging ? { opacity: 0.5, transform: 'rotate(2deg)' } : {}}
      draggable
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          <PriorityBadge priority={task.priority} />
          {isOverdue && (
            <span className="badge badge-blocked" style={{ fontSize: 10 }}>
              Vencida +{getDaysOverdue(task.dueDate)}d
            </span>
          )}
          {!task.assigneeId && (
            <span className="badge badge-todo" style={{ fontSize: 10 }}>
              Sin asignar
            </span>
          )}
        </div>
        {hovered && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '0 3px', opacity: 0.6 }}
            onClick={e => e.stopPropagation()}
          >
            <Icon name="more-horizontal" size={13} />
          </button>
        )}
      </div>

      <div className="kanban-card-title">{task.title}</div>

      {task.description && (
        <div className="kanban-card-desc">{task.description}</div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="kanban-card-tags">
          {task.tags.map(t => (
            <span key={t} className="kanban-card-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {totalChecks > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: 'var(--text-muted)',
              marginBottom: 3,
            }}
          >
            <span>{doneChecks}/{totalChecks} subtareas</span>
            <span>{Math.round((doneChecks / totalChecks) * 100)}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 99 }}>
            <div
              style={{
                width: `${(doneChecks / totalChecks) * 100}%`,
                height: '100%',
                background: '#10b981',
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      )}

      <div className="kanban-card-footer">
        <div className="kanban-card-meta">
          <div className="kanban-card-meta-item">
            <Icon name="calendar" size={11} />
            <span
              style={{
                color: isOverdue ? '#dc2626' : 'inherit',
                fontWeight: isOverdue ? 700 : 400,
              }}
            >
              {formatDate(task.dueDate)}
            </span>
          </div>
          {task.comments > 0 && (
            <div className="kanban-card-meta-item">
              <Icon name="message-square" size={11} />
              {task.comments}
            </div>
          )}
        </div>
        {assignee ? (
          <Avatar user={assignee} size="sm" />
        ) : (
          <div
            className="avatar avatar-sm"
            style={{ background: '#f1f5f9', border: '1.5px dashed #cbd5e1' }}
            title="Sin responsable"
          >
            <Icon name="user" size={10} style={{ color: '#94a3b8' }} />
          </div>
        )}
      </div>
    </div>
  );
}

type KanbanBoardProps = {
  projectId?: string;
  onOpenTask: (task: MockTask) => void;
};

export function KanbanBoard({ projectId, onOpenTask }: KanbanBoardProps) {
  const [tasks, setTasks]         = useState<MockTask[]>(
    projectId ? getTasksByProject(projectId) : TASKS.slice(0, 10),
  );
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const tasksByCol = (col: string) => tasks.filter(t => t.status === col);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    e.preventDefault();
    if (draggingId) {
      setTasks(ts => ts.map(t => (t.id === draggingId ? { ...t, status: colId } : t)));
    }
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragLeave = () => setDragOverCol(null);

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasksByCol(col.id);
        const isOver   = dragOverCol === col.id;
        return (
          <div
            key={col.id}
            className="kanban-column"
            style={{
              background: isOver ? '#f0f4ff' : 'var(--bg)',
              transition: 'background 0.15s',
              border: isOver ? '2px dashed #6366f1' : '2px solid transparent',
            }}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={e => handleDrop(e, col.id)}
            onDragLeave={handleDragLeave}
          >
            <div className="kanban-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: col.color }} />
                <span className="kanban-column-title">{col.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="kanban-column-count">{colTasks.length}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0 4px', color: 'var(--text-muted)' }}
                  title={`Agregar tarea en ${col.label}`}
                >
                  <Icon name="plus" size={13} />
                </button>
              </div>
            </div>

            <div className="kanban-cards">
              {colTasks.length === 0 ? (
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 8,
                    padding: '20px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                  }}
                >
                  Arrastra aquí
                </div>
              ) : (
                colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverCol(null);
                    }}
                  >
                    <KanbanCard
                      task={task}
                      onOpen={onOpenTask}
                      isDragging={draggingId === task.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TaskBoardPage({ projectId, onOpenTask }: TaskBoardPageProps) {
  return <KanbanBoard projectId={projectId} onOpenTask={onOpenTask} />;
}
