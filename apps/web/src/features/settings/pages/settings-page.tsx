import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import {
  Avatar, Btn, Tabs, FormGroup, PageHeader,
} from '../../../shared/components/ui/ui-components';
import {
  USERS, getUserById,
} from '../../../mock-data';
import type { AddToast } from '../../../app/layouts/AppShell';

type SettingsPageProps = {
  navigate: (p: string) => void;
  addToast: AddToast;
};

type Profile = {
  name: string;
  email: string;
  role: string;
  bio: string;
};

type Permission = {
  id: string;
  label: string;
};

type Role = {
  id: string;
  label: string;
  color: string;
  perms: string[];
};

type NotifSetting = {
  id: string;
  label: string;
  desc: string;
};

type Integration = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  status: 'connected' | 'disconnected';
  color: string;
};

const PERMISSIONS: Permission[] = [
  { id: 'create_projects',  label: 'Crear proyectos' },
  { id: 'archive_projects', label: 'Archivar proyectos' },
  { id: 'create_tasks',     label: 'Crear tareas' },
  { id: 'change_status',    label: 'Cambiar estado' },
  { id: 'view_analytics',   label: 'Ver analíticas' },
  { id: 'use_ai',           label: 'Usar IA' },
];

const ROLES: Role[] = [
  { id: 'admin',  label: 'Admin',           color: '#6366f1', perms: ['create_projects', 'archive_projects', 'create_tasks', 'change_status', 'view_analytics', 'use_ai'] },
  { id: 'pm',     label: 'Project Manager', color: '#0891b2', perms: ['create_projects', 'create_tasks', 'change_status', 'view_analytics', 'use_ai'] },
  { id: 'member', label: 'Member',          color: '#059669', perms: ['create_tasks', 'change_status'] },
  { id: 'viewer', label: 'Viewer',          color: '#d97706', perms: [] },
];

const NOTIF_SETTINGS: NotifSetting[] = [
  { id: 'overdue_tasks',  label: 'Tareas vencidas',          desc: 'Notificar cuando una tarea supere su fecha límite' },
  { id: 'assigned_tasks', label: 'Tareas asignadas',         desc: 'Notificar cuando te asignen una nueva tarea' },
  { id: 'status_changes', label: 'Cambios de estado',        desc: 'Notificar cambios de estado en tus tareas' },
  { id: 'comments',       label: 'Comentarios',              desc: 'Notificar nuevos comentarios en tus tareas' },
  { id: 'critical_recs',  label: 'Recomendaciones críticas', desc: 'Notificar alertas críticas del sistema' },
];

const INTEGRATIONS: Integration[] = [
  { id: 'keycloak', name: 'Keycloak SSO',    desc: 'Proveedor de identidad empresarial para autenticación SSO', icon: 'lock',     status: 'connected',    color: '#1d4ed8' },
  { id: 'ai',       name: 'Proveedor de IA', desc: 'API de IA para recomendaciones inteligentes y análisis',    icon: 'sparkles', status: 'disconnected', color: '#7c3aed' },
  { id: 'webhooks', name: 'Webhooks',        desc: 'Notificaciones HTTP a servicios externos en tiempo real',   icon: 'link',     status: 'disconnected', color: '#059669' },
];

type TabId = 'profile' | 'team' | 'roles' | 'notifications' | 'preferences' | 'integrations';

export function SettingsPage({ addToast }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [profile, setProfile]     = useState<Profile>({
    name:  'Dixon Anato',
    email: 'admin@taskflow.com',
    role:  'Admin',
    bio:   'Administrador principal de la plataforma TaskFlow Pro.',
  });
  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map(n => [n.id, true])),
  );
  const [inviteEmail, setInviteEmail] = useState('');

  const tabs = [
    { id: 'profile',       label: 'Perfil',           icon: 'user' },
    { id: 'team',          label: 'Equipo',            icon: 'users' },
    { id: 'roles',         label: 'Roles y permisos',  icon: 'shield' },
    { id: 'notifications', label: 'Notificaciones',    icon: 'bell' },
    { id: 'preferences',   label: 'Preferencias',      icon: 'settings' },
    { id: 'integrations',  label: 'Integraciones',     icon: 'link' },
  ];

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Administra tu perfil, equipo y preferencias de la plataforma"
      />

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={v => setActiveTab(v as TabId)} />
      </div>

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Información personal</div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
                padding: '4px 0',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar user={getUserById(1)} size="xl" />
                <button
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    background: '#6366f1',
                    border: '2px solid white',
                    borderRadius: 99,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="edit" size={10} style={{ color: 'white' }} />
                </button>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{profile.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile.role}</div>
                <button
                  style={{
                    fontSize: 12,
                    color: '#6366f1',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    fontFamily: 'inherit',
                  }}
                >
                  <Icon name="upload" size={12} /> Cambiar foto
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormGroup label="Nombre completo">
                <input
                  className="form-input"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                />
              </FormGroup>
              <FormGroup label="Correo electrónico">
                <input
                  className="form-input"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  type="email"
                />
              </FormGroup>
              <FormGroup label="Rol">
                <input
                  className="form-input"
                  value={profile.role}
                  disabled
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
                />
              </FormGroup>
              <FormGroup label="Biografía">
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                />
              </FormGroup>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <Btn variant="secondary" size="sm">
                  Cancelar
                </Btn>
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => addToast({ message: 'Perfil actualizado', type: 'success' })}
                >
                  Guardar cambios
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Miembros del equipo</div>
                <div className="card-subtitle">{USERS.length} miembros activos</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {USERS.map(u => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <Avatar user={u} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 99,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {u.role}
                  </span>
                  {u.id !== 1 && (
                    <Btn variant="ghost" size="sm">
                      Editar
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Invitar miembro</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                placeholder="email@empresa.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ flex: 1 }}
              />
              <Btn
                variant="primary"
                size="sm"
                icon="plus"
                onClick={() => {
                  setInviteEmail('');
                  addToast({ message: 'Invitación enviada', type: 'success' });
                }}
              >
                Invitar
              </Btn>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div>
          {ROLES.map(role => (
            <div key={role.id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{ width: 10, height: 10, borderRadius: 3, background: role.color }}
                />
                <span style={{ fontSize: 15, fontWeight: 700 }}>{role.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                  {USERS.filter(
                    u =>
                      u.role.toLowerCase().includes(role.id) ||
                      (u.role === 'Admin' && role.id === 'admin'),
                  ).length}{' '}
                  usuario(s)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {PERMISSIONS.map(perm => (
                  <div
                    key={perm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '8px 10px',
                      background: 'var(--bg)',
                      borderRadius: 8,
                      fontSize: 12.5,
                      color: role.perms.includes(perm.id) ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: role.perms.includes(perm.id) ? '#6366f1' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {role.perms.includes(perm.id) && (
                        <Icon name="check" size={10} style={{ color: 'white' }} />
                      )}
                    </div>
                    {perm.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Preferencias de notificación</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {NOTIF_SETTINGS.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < NOTIF_SETTINGS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>
                      {n.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.desc}</div>
                  </div>
                  <label
                    style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={notifSettings[n.id]}
                      onChange={e =>
                        setNotifSettings(s => ({ ...s, [n.id]: e.target.checked }))
                      }
                      style={{ opacity: 0, position: 'absolute' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 99,
                        background: notifSettings[n.id] ? '#6366f1' : '#e2e8f0',
                        transition: 'background 0.2s',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: notifSettings[n.id] ? 22 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: 99,
                        background: 'white',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div>
          {INTEGRATIONS.map(intg => (
            <div
              key={intg.id}
              className="card"
              style={{ marginBottom: 14, padding: 0, overflow: 'hidden' }}
            >
              <div style={{ height: 3, background: intg.color }} />
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={intg.icon} size={20} style={{ color: intg.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 3 }}>
                    {intg.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{intg.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 99,
                      background: intg.status === 'connected' ? '#f0fdf4' : 'var(--bg)',
                      color: intg.status === 'connected' ? '#16a34a' : 'var(--text-muted)',
                      border: `1px solid ${intg.status === 'connected' ? '#bbf7d0' : 'var(--border)'}`,
                    }}
                  >
                    {intg.status === 'connected' ? '✓ Conectado' : 'Desconectado'}
                  </span>
                  <Btn
                    variant={intg.status === 'connected' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() =>
                      addToast({
                        message:
                          intg.status === 'connected'
                            ? `${intg.name} desconectado`
                            : `${intg.name} conectado`,
                        type: intg.status === 'connected' ? 'info' : 'success',
                      })
                    }
                  >
                    {intg.status === 'connected' ? 'Desconectar' : 'Conectar'}
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div style={{ maxWidth: 480 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Apariencia y preferencias</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormGroup label="Idioma">
                <select className="form-select">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </FormGroup>
              <FormGroup label="Zona horaria">
                <select className="form-select">
                  <option>America/Bogota (UTC-5)</option>
                  <option>America/Mexico_City (UTC-6)</option>
                  <option>Europe/Madrid (UTC+2)</option>
                </select>
              </FormGroup>
              <FormGroup label="Tema">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Claro', 'Oscuro', 'Sistema'].map(t => (
                    <button
                      key={t}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1.5px solid',
                        borderColor: t === 'Claro' ? '#6366f1' : 'var(--border)',
                        borderRadius: 8,
                        background: t === 'Claro' ? '#f5f3ff' : 'white',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: t === 'Claro' ? 700 : 500,
                        color: t === 'Claro' ? '#6366f1' : 'var(--text-secondary)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FormGroup>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => addToast({ message: 'Preferencias guardadas', type: 'success' })}
                >
                  Guardar
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
