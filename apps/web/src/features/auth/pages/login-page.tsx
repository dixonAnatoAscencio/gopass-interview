import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginRequestSchema, type LoginRequest } from '@gopass/contracts';
import { useLogin } from '../hooks/use-login';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequestSchema) });

  const { mutate: login, error } = useLogin({
    onSuccess: () => navigate(from, { replace: true }),
  });

  return (
    <div style={{
      background: '#fff',
      borderRadius: '0.75rem',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>GoPass</h1>
      <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Gestión de Proyectos y Tareas
      </p>

      <form onSubmit={handleSubmit((data) => login(data))} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="dixon@gopass.dev"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: `1px solid ${errors.email ? 'var(--color-danger)' : 'var(--color-gray-200)'}`,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          />
          {errors.email && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Contraseña
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: `1px solid ${errors.password ? 'var(--color-danger)' : 'var(--color-gray-200)'}`,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          />
          {errors.password && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--color-danger)',
            marginBottom: '1rem',
          }}>
            Credenciales inválidas
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.625rem',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
