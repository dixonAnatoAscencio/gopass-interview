import { useEffect, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { getUserById, type MockUser } from '../../../mock-data';

// ── Status / Priority Badges ──────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  todo:             { label:'Pendiente',    cls:'badge-todo' },
  in_progress:      { label:'En progreso',  cls:'badge-progress' },
  blocked:          { label:'Bloqueada',    cls:'badge-blocked' },
  in_review:        { label:'En revisión',  cls:'badge-review' },
  done:             { label:'Completada',   cls:'badge-done' },
  archived:         { label:'Archivada',    cls:'badge-archived' },
  active:           { label:'Activo',       cls:'badge-progress' },
  at_risk:          { label:'En riesgo',    cls:'badge-blocked' },
  completed:        { label:'Completado',   cls:'badge-done' },
  in_progress_proj: { label:'En progreso',  cls:'badge-review' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: 'badge-todo' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  low:    { label:'Baja',    cls:'badge-low' },
  medium: { label:'Media',   cls:'badge-medium' },
  high:   { label:'Alta',    cls:'badge-high' },
  urgent: { label:'Urgente', cls:'badge-urgent' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_MAP[priority] ?? { label: priority, cls: 'badge-medium' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const RISK_MAP: Record<string, { label: string; cls: string }> = {
  low:    { label:'Bajo',  cls:'badge-risk-low' },
  medium: { label:'Medio', cls:'badge-risk-medium' },
  high:   { label:'Alto',  cls:'badge-risk-high' },
};

export function RiskBadge({ level }: { level: string }) {
  const cfg = RISK_MAP[level] ?? { label: level, cls:'badge-risk-medium' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ user, size = 'md', style: extra = {} }: { user: MockUser | null; size?: string; style?: CSSProperties }) {
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : size === 'xl' ? 18 : 13;
  if (!user) {
    return (
      <div className={`avatar avatar-${size}`} style={{ background:'#e2e8f0', color:'#94a3b8', ...extra }} title="Sin asignar">
        <Icon name="user" size={iconSize} />
      </div>
    );
  }
  return (
    <div className={`avatar avatar-${size}`} style={{ background: user.color, ...extra }} title={user.name}>
      {user.initials}
    </div>
  );
}

export function AvatarGroup({ userIds, max = 4 }: { userIds: number[]; max?: number }) {
  const shown = userIds.slice(0, max);
  const rest = userIds.length - max;
  return (
    <div className="avatar-group">
      {rest > 0 && (
        <div className="avatar avatar-sm" style={{ background:'#e2e8f0', color:'#64748b', border:'2px solid white', marginLeft:-8, fontSize:9 }}>
          +{rest}
        </div>
      )}
      {[...shown].reverse().map((id, idx) => (
        <Avatar key={id} user={getUserById(id)} size="sm" style={{ border:'2px solid white', marginLeft: idx === 0 ? 0 : -8 }} />
      ))}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const bg = color ?? (pct >= 80 ? '#10b981' : pct >= 50 ? '#6366f1' : pct >= 30 ? '#f59e0b' : '#ef4444');
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-fill" style={{ width:`${pct}%`, background: bg }} />
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps {
  variant?: string;
  size?: string;
  icon?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

export function Btn({ variant = 'primary', size = '', icon, children, onClick, disabled, type = 'button', style: s = {} }: BtnProps) {
  return (
    <button type={type} className={`btn btn-${variant}${size ? ` btn-${size}` : ''}`} onClick={onClick} disabled={disabled} style={s}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id:string; label:string; icon?:string; count?:number }[]; active: string; onChange: (id:string)=>void }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <div key={t.id} className={`tab-item${active===t.id?' active':''}`} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={14} />}
          {t.label}
          {t.count != null && <span className="tab-count">{t.count}</span>}
        </div>
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export interface Toast { id: number; message: string; type?: string; }

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type ?? 'info'}`}>
          <Icon name={t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'alert-circle' : 'info'} size={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: ()=>void; title: string; size?: string; children: ReactNode; footer?: ReactNode; }

export function Modal({ isOpen, onClose, title, size = 'md', children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{padding:'0 6px'}}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel='Confirmar', danger=false }: { isOpen:boolean; onClose:()=>void; onConfirm:()=>void; title:string; message:string; confirmLabel?:string; danger?:boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={
      <>
        <Btn variant="secondary" size="sm" onClick={onClose}>Cancelar</Btn>
        <Btn variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmLabel}</Btn>
      </>
    }>
      <p style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>{message}</p>
    </Modal>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width='100%', height=16, radius=8, style: s={} }: { width?:string|number; height?:number; radius?:number; style?:CSSProperties }) {
  return <div className="skeleton" style={{ width, height, borderRadius:radius, ...s }} />;
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon='layers', title, description, action }: { icon?:string; title:string; description?:string; action?:ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon name={icon} size={28} /></div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action}
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
export function MetricCard({ icon, iconBg, iconColor, value, label, change, changeType='positive', subtitle }: { icon:string; iconBg?:string; iconColor?:string; value:React.ReactNode; label:string; change?:string; changeType?:string; subtitle?:string }) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <div className="metric-icon" style={{ background: iconBg ?? '#f0f4ff' }}>
          <Icon name={icon} size={18} style={{ color: iconColor ?? '#6366f1' }} />
        </div>
        {change != null && (
          <div className={`metric-change ${changeType}`}>
            <Icon name={changeType==='positive'?'trending-up':changeType==='negative'?'trending-down':'activity'} size={12} />
            {change}
          </div>
        )}
      </div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {subtitle && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title:string; subtitle?:string; actions?:ReactNode[] }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

// ── Filter Select / Search ────────────────────────────────────────────────────
export function FilterSelect({ value, onChange, options, placeholder }: { value:string; onChange:(v:string)=>void; options:{value:string;label:string}[]; placeholder:string }) {
  return (
    <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder='Buscar…' }: { value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>
        <Icon name="search" size={13} />
      </div>
      <input type="text" className="search-input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ── Form helpers ──────────────────────────────────────────────────────────────
export function FormGroup({ label, children, required }: { label:string; children:ReactNode; required?:boolean }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}</label>
      {children}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
export function Drawer({ isOpen, onClose, children }: { isOpen:boolean; onClose:()=>void; children:ReactNode }) {
  if (!isOpen) return null;
  return createPortal(
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">{children}</div>
    </>,
    document.body
  );
}

// ── Insight Card ──────────────────────────────────────────────────────────────
export function InsightCard({ severity, title, description, onApply, onIgnore }: { severity:string; title:string; description:string; onApply?:()=>void; onIgnore?:()=>void }) {
  return (
    <div className="insight-card">
      <div className={`insight-severity ${severity}`} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{title}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{description}</div>
        {(onApply || onIgnore) && (
          <div style={{ display:'flex', gap:6, marginTop:8 }}>
            {onApply  && <Btn variant="primary" size="sm" onClick={onApply}>Aplicar</Btn>}
            {onIgnore && <Btn variant="ghost"   size="sm" onClick={onIgnore}>Ignorar</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}
