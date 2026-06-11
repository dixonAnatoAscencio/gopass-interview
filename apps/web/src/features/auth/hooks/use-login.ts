import { useMutation } from '@tanstack/react-query';
import type { LoginRequest, LoginResponse } from '@gopass/contracts';
import { post } from '../../../shared/services/http-client';
import { useAuthStore } from '../../../shared/stores/auth.store';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: LoginRequest) => post<LoginResponse>('/auth/login', data),
    onSuccess: (response) => {
      setSession(response.user, response.accessToken, response.refreshToken);
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
