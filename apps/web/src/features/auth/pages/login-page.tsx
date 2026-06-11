import { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';
import { Avatar } from '../../../shared/components/ui/ui-components';
import { USERS, getUserById } from '../../../mock-data';

const DEMO_ACCOUNTS = [
  { email:'admin@taskflow.com',   role:'Admin',           userId:1 },
  { email:'manager@taskflow.com', role:'Project Manager', userId:2 },
  { email:'carlos@taskflow.com',  role:'Member',          userId:3 },
];

const s = {
  root:       { display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:'inherit' } as const,
  left:       { flex:'0 0 48%', background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px' } as const,
  right:      { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' } as const,
  formCard:   { width:'100%', maxWidth:420 } as const,
  submitBtn:  { height:44, background:'#6366f1', color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', fontFamily:'inherit' } as const,
};

export function LoginPage({ onLogin }: { onLogin: ()=>void }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Por favor completa todos los campos.'); return; }
    setLoading(true);
    setTimeout(() => {
      const valid = DEMO_ACCOUNTS.find(a => a.email === email);
      if (valid && password === 'demo123') { onLogin(); }
      else { setError('Credenciales incorrectas. Usa una cuenta demo con contraseña: demo123'); setLoading(false); }
    }, 900);
  };

  return (
    <div style={s.root}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:48}}>
            <div style={{width:40,height:40,background:'rgba(255,255,255,0.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'white'}}>TF</div>
            <span style={{fontSize:20,fontWeight:800,color:'white'}}>TaskFlow Pro</span>
          </div>
          <h2 style={{fontSize:28,fontWeight:800,color:'white',lineHeight:1.3,marginBottom:16,maxWidth:420}}>
            Organiza proyectos, prioriza tareas y detecta riesgos antes de que impacten al equipo.
          </h2>
          <p style={{fontSize:14.5,color:'rgba(255,255,255,0.7)',lineHeight:1.7,marginBottom:32,maxWidth:400}}>
            La plataforma SaaS empresarial para equipos de alto rendimiento. Gestión de proyectos, analíticas avanzadas y recomendaciones inteligentes en un solo lugar.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {['Tableros Kanban en tiempo real','Recomendaciones inteligentes con IA','Analíticas y métricas avanzadas','Roles y permisos granulares'].map(f => (
              <div key={f} style={{display:'flex',alignItems:'center',gap:12,color:'rgba(255,255,255,0.85)',fontSize:13.5}}>
                <div style={{width:6,height:6,background:'#a5b4fc',borderRadius:3,flexShrink:0}} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.4)',fontSize:12,position:'relative',zIndex:1}}>
          Plataforma de gestión empresarial · Senior Technical Demo
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formCard}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <div style={{width:48,height:48,background:'#6366f1',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'white'}}>TF</div>
            </div>
            <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:6}}>Iniciar sesión</h1>
            <p style={{fontSize:14,color:'#94a3b8'}}>Bienvenido de vuelta a TaskFlow Pro</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16,marginBottom:20}} noValidate>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-input" placeholder="nombre@empresa.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label className="form-label" style={{margin:0}}>Contraseña</label>
                <a href="#" style={{fontSize:12.5,color:'#6366f1',fontWeight:600}}>¿Olvidé mi contraseña?</a>
              </div>
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#fff5f5',border:'1px solid #fecaca',borderRadius:8,padding:'10px 12px',color:'#dc2626',fontSize:12.5}}>
                <Icon name="alert-circle" size={14} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? (
                <>
                  <div style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:9999,animation:'spin 0.6s linear infinite'}} />
                  Verificando…
                </>
              ) : 'Ingresar'}
            </button>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0 16px'}}>
            <div style={{flex:1,height:1,background:'#e2e8f0'}} />
            <span style={{fontSize:11,color:'#94a3b8',fontWeight:600,whiteSpace:'nowrap'}}>Cuentas de demostración</span>
            <div style={{flex:1,height:1,background:'#e2e8f0'}} />
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'white',border:'1.5px solid #e2e8f0',borderRadius:10,cursor:'pointer',fontFamily:'inherit'}}
                onClick={() => { setEmail(acc.email); setPassword('demo123'); setError(''); }}
              >
                <Avatar user={getUserById(acc.userId)} size="sm" />
                <div style={{textAlign:'left',flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:'var(--text-primary)'}}>{USERS.find(u=>u.id===acc.userId)?.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{acc.role}</div>
                </div>
                <span style={{fontSize:10.5,color:'var(--text-muted)',background:'var(--bg)',padding:'2px 7px',borderRadius:99,border:'1px solid var(--border)'}}>Usar</span>
              </button>
            ))}
          </div>

          <p style={{fontSize:11,color:'#cbd5e1',textAlign:'center'}}>
            Prueba técnica senior · Frontend SaaS Demo · React 18
          </p>
        </div>
      </div>
    </div>
  );
}
