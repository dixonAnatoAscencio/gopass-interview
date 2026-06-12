import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '../../../shared/components/ui/Icon';
import { Avatar } from '../../../shared/components/ui/ui-components';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { post } from '../../../shared/services/http-client';
import type { LoginResponse } from '@gopass/contracts';

const DEMO_ACCOUNTS = [
  { id:1, email: 'dixon@gopass.dev',  password: 'Password123!', name: 'Dixon Anato',  role: 'Admin',           color: '#6366f1', initials: 'DA' },
  { id:2, email: 'laura@gopass.dev',  password: 'Password123!', name: 'Laura Méndez', role: 'Project Manager', color: '#0891b2', initials: 'LM' },
  { id:3, email: 'carlos@gopass.dev', password: 'Password123!', name: 'Carlos Rojas', role: 'Member',          color: '#059669', initials: 'CR' },
];

export function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const { mutate: login, isPending, isError } = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      post<LoginResponse>('/auth/login', data),
    onSuccess: (res) => {
      setSession(res.user, res.accessToken, res.refreshToken);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login({ email, password });
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:'inherit' }}>
      {/* Left panel */}
      <div style={{ flex:'0 0 48%', background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{ width:40, height:40, background:'rgba(255,255,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'white' }}>PT</div>
            <span style={{ fontSize:20, fontWeight:800, color:'white' }}>Prueba Técnica Senior</span>
          </div>
          <h2 style={{ fontSize:28, fontWeight:800, color:'white', lineHeight:1.3, marginBottom:16, maxWidth:420 }}>
            Organiza proyectos, prioriza tareas y detecta riesgos antes de que impacten al equipo.
          </h2>
          <p style={{ fontSize:14.5, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:32, maxWidth:400 }}>
            La plataforma SaaS empresarial para equipos de alto rendimiento. Gestión de proyectos, analíticas avanzadas y recomendaciones inteligentes en un solo lugar.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {['Tableros Kanban en tiempo real','Recomendaciones inteligentes con IA','Analíticas y métricas avanzadas','Roles y permisos granulares'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.85)', fontSize:13.5 }}>
                <div style={{ width:6, height:6, background:'#a5b4fc', borderRadius:3, flexShrink:0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
          Prueba técnica Senior Full Stack · NestJS + React + PostgreSQL
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <div style={{ width:48, height:48, background:'#6366f1', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:18, color:'white' }}>PT</div>
            </div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#0f172a', marginBottom:6 }}>Iniciar sesión</h1>
            <p style={{ fontSize:14, color:'#94a3b8' }}>Gestión de proyectos y tareas · Full Stack Senior</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }} noValidate>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-input" placeholder="nombre@empresa.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {isError && (
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff5f5', border:'1px solid #fecaca', borderRadius:8, padding:'10px 12px', color:'#dc2626', fontSize:12.5 }}>
                <Icon name="alert-circle" size={14} />
                <span>Credenciales incorrectas. Usa una de las cuentas demo.</span>
              </div>
            )}

            <button type="submit" disabled={isPending}
              style={{ height:44, background:'#6366f1', color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor: isPending ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: isPending ? 0.7 : 1, fontFamily:'inherit' }}>
              {isPending ? (
                <>
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:9999, animation:'spin 0.6s linear infinite' }} />
                  Verificando…
                </>
              ) : 'Ingresar'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 16px' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600, whiteSpace:'nowrap' }}>Cuentas de demostración</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.email} type="button"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'white', border:'1.5px solid #e2e8f0', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}>
                <Avatar user={acc} size="sm" />
                <div style={{ textAlign:'left', flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-primary)' }}>{acc.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{acc.role}</div>
                </div>
                <span style={{ fontSize:10.5, color:'var(--text-muted)', background:'var(--bg)', padding:'2px 7px', borderRadius:99, border:'1px solid var(--border)' }}>Usar</span>
              </button>
            ))}
          </div>

          <p style={{ fontSize:11, color:'#cbd5e1', textAlign:'center' }}>
            Prueba técnica senior · NestJS + React · PostgreSQL en Render
          </p>
        </div>
      </div>
    </div>
  );
}
