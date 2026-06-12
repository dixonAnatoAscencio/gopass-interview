import { useState, useCallback, type ReactNode } from 'react';
import { Icon } from '../../shared/components/ui/Icon';
import { Avatar, Btn, ToastContainer, type Toast } from '../../shared/components/ui/ui-components';
import { useAuthStore } from '../../shared/stores/auth.store';
import type { MockUser } from '../../mock-data';

const NAV_ITEMS = [
  { id:'dashboard',       label:'Dashboard',       icon:'layout-dashboard' },
  { id:'projects',        label:'Proyectos',        icon:'folder' },
  { id:'my-tasks',        label:'Mis tareas',       icon:'check-square' },
  { id:'overdue',         label:'Tareas vencidas',  icon:'clock',       badge:7 },
  { id:'analytics',       label:'Analíticas',       icon:'bar-chart' },
  { id:'recommendations', label:'Recomendaciones',  icon:'lightbulb',   badge:4 },
  { id:'archived',        label:'Archivados',       icon:'archive' },
  { id:'settings',        label:'Configuración',    icon:'settings' },
];

const BREADCRUMBS: Record<string,string[]> = {
  dashboard:       ['Dashboard'],
  projects:        ['Proyectos'],
  'my-tasks':      ['Mis tareas'],
  overdue:         ['Tareas vencidas'],
  analytics:       ['Analíticas'],
  recommendations: ['Recomendaciones'],
  archived:        ['Archivados'],
  settings:        ['Configuración'],
  'project-detail':['Proyectos','…'],
};

interface SidebarProps {
  currentPage: string;
  navigate: (page:string)=>void;
  collapsed: boolean;
  onToggle: ()=>void;
}

function Sidebar({ currentPage, navigate, collapsed, onToggle }: SidebarProps) {
  const authUser = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const user: MockUser | null = authUser
    ? { id: 1, name: authUser.name, email: authUser.email, role: authUser.role, initials: authUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(), color: '#6366f1' }
    : null;
  const cls = ['sidebar', collapsed ? 'collapsed' : ''].filter(Boolean).join(' ');

  return (
    <aside className={cls}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">PT</div>
        <div className="sidebar-logo-text">Prueba Técnica</div>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Principal</div>}
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`sidebar-item${currentPage === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-item-icon"><Icon name={item.icon} size={17} /></span>
            <span>{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <Avatar user={user} size="sm" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          {!collapsed && (
            <button className="btn btn-ghost" style={{padding:'0 4px',color:'var(--sidebar-text-muted)'}} title="Cerrar sesión" onClick={logout}>
              <Icon name="log-out" size={14} />
            </button>
          )}
        </div>
        <button className="sidebar-collapse-btn" onClick={onToggle} title={collapsed ? 'Expandir' : 'Colapsar'}>
          <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={16} />
        </button>
      </div>
    </aside>
  );
}

interface HeaderProps {
  currentPage: string;
  projectName?: string;
  onNewTask: ()=>void;
  onNewProject: ()=>void;
}

function Header({ currentPage, projectName, onNewTask, onNewProject }: HeaderProps) {
  const crumbs = BREADCRUMBS[currentPage] ?? [currentPage];
  const [search, setSearch] = useState('');
  const authUser = useAuthStore((s) => s.user);
  const headerUser: MockUser | null = authUser
    ? { id: 1, name: authUser.name, email: authUser.email, role: authUser.role, initials: authUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(), color: '#6366f1' }
    : null;
  const shortName = authUser?.name.split(' ')[0] ?? 'Usuario';

  return (
    <header className="header">
      <div className="header-breadcrumb">
        {crumbs.map((c,i) => (
          <span key={i} style={{display:'flex',alignItems:'center',gap:6}}>
            {i > 0 && <Icon name="chevron-right" size={12} style={{opacity:0.4}} />}
            <span className={i === crumbs.length - 1 ? 'header-breadcrumb-current' : ''}>
              {i === crumbs.length - 1 && projectName ? projectName : c}
            </span>
          </span>
        ))}
      </div>

      <div className="header-search">
        <div className="header-search-icon"><Icon name="search" size={14} /></div>
        <input type="text" placeholder="Buscar tareas, proyectos…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="header-actions">
        <Btn variant="secondary" size="sm" icon="plus" onClick={onNewTask}>Nueva tarea</Btn>
        <Btn variant="primary"   size="sm" icon="plus" onClick={onNewProject}>Nuevo proyecto</Btn>
        <button className="header-icon-btn" title="Notificaciones">
          <Icon name="bell" size={17} />
          <span className="header-notif-dot" />
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 4px',cursor:'pointer',borderLeft:'1px solid var(--border)',marginLeft:4}}>
          <Avatar user={headerUser} size="sm" />
          <span style={{fontSize:12.5,fontWeight:600,color:'var(--text-secondary)'}}>{shortName}</span>
        </div>
      </div>
    </header>
  );
}

// ── Public hook to add toasts ─────────────────────────────────────────────────
export type { Toast };
export type AddToast = (opts:{message:string;type?:string})=>void;

// ── AppShell ──────────────────────────────────────────────────────────────────
interface AppShellProps {
  children: (ctx:{
    navigate:(page:string)=>void;
    addToast:AddToast;
    currentPage:string;
    openTask:(task:unknown)=>void;
  })=>ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const navigate = useCallback((page:string) => setCurrentPage(page), []);

  const addToast: AddToast = useCallback(({ message, type='info' }) => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  const openTask = useCallback((_task:unknown) => {
    // Task drawer wired in children
  }, []);

  const PAGE_TITLES: Record<string,string> = {
    dashboard:'Dashboard', projects:'Proyectos', 'my-tasks':'Mis tareas',
    overdue:'Tareas vencidas', analytics:'Analíticas', recommendations:'Recomendaciones',
    archived:'Archivados', settings:'Configuración', 'project-detail':'Proyecto',
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} navigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(c=>!c)} />
      <div className="main-area">
        <Header
          currentPage={currentPage}
          projectName={PAGE_TITLES[currentPage]}
          onNewTask={() => addToast({message:'Abre formulario de nueva tarea',type:'info'})}
          onNewProject={() => addToast({message:'Abre formulario de nuevo proyecto',type:'info'})}
        />
        <main className="page-content">
          {children({ navigate, addToast, currentPage, openTask })}
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
