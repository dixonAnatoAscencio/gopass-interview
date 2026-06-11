import { Icon } from './Icon';
import { Btn } from './ui-components';

// ── Shared Error Page base ────────────────────────────────────────────────────

interface ErrorPageProps {
  code: 403 | 404 | 500;
  title: string;
  description: string;
  navigate: (p: string) => void;
}

const CONFIGS: Record<number, { icon: string; color: string; bg: string; accent: string }> = {
  403: { icon: 'lock',           color: '#7c3aed', bg: '#f5f3ff', accent: '#ddd6fe' },
  404: { icon: 'search',         color: '#2563eb', bg: '#eff6ff', accent: '#bfdbfe' },
  500: { icon: 'alert-triangle', color: '#dc2626', bg: '#fff5f5', accent: '#fecaca' },
};

const ERROR_HINTS: Record<number, string> = {
  403: 'No tienes permisos para acceder a este recurso. Contacta al administrador.',
  404: 'El recurso que buscas no existe o fue movido. Verifica la URL.',
  500: 'Error interno del servidor. El equipo técnico ha sido notificado.',
};

function ErrorPage({ code, title, description, navigate }: ErrorPageProps) {
  const cfg = CONFIGS[code] ?? CONFIGS[404];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'inherit', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Decorative circle */}
        <div style={{ width: 100, height: 100, borderRadius: 99, background: cfg.bg, border: `2px solid ${cfg.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon name={cfg.icon} size={40} style={{ color: cfg.color }} />
        </div>

        <div style={{ fontSize: 64, fontWeight: 900, color: cfg.color, lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
          {code}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
          {title}
        </h1>

        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
          {description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Btn variant="primary"    icon="home"          onClick={() => navigate('dashboard')}>Ir al Dashboard</Btn>
          <Btn variant="secondary"  icon="chevron-left"  onClick={() => navigate('dashboard')}>Volver</Btn>
        </div>

        <div style={{ marginTop: 32, padding: '12px 20px', background: cfg.bg, borderRadius: 10, border: `1px solid ${cfg.accent}`, fontSize: 12, color: cfg.color, display: 'inline-block' }}>
          {ERROR_HINTS[code]}
        </div>
      </div>
    </div>
  );
}

// ── Exported page components ──────────────────────────────────────────────────

export function Page403({ navigate }: { navigate: (p: string) => void }) {
  return (
    <ErrorPage
      code={403}
      title="Sin permisos de acceso"
      description="No tienes los permisos necesarios para ver esta página. Si crees que esto es un error, contacta al administrador del sistema."
      navigate={navigate}
    />
  );
}

export function Page404({ navigate }: { navigate: (p: string) => void }) {
  return (
    <ErrorPage
      code={404}
      title="Página no encontrada"
      description="La página que buscas no existe o fue eliminada. Puede que la URL sea incorrecta o el recurso haya sido movido a otra ubicación."
      navigate={navigate}
    />
  );
}

export function Page500({ navigate }: { navigate: (p: string) => void }) {
  return (
    <ErrorPage
      code={500}
      title="Error interno del servidor"
      description="Ocurrió un error inesperado. Nuestro equipo técnico ya fue notificado y está trabajando en la solución. Por favor intenta de nuevo en unos minutos."
      navigate={navigate}
    />
  );
}
