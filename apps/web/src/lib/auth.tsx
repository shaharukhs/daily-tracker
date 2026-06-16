'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Leave NEXT_PUBLIC_API_URL unset in the cloud: the client then uses the relative
// `/api/v1`, which next.config.mjs proxies to the API (same-origin → cookies just work).
// Local dev falls back to the local API when the var isn't provided.
const API =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
const BASE = `${API}/api/v1`;

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export type AuthStatus = 'loading' | 'authed' | 'anon';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Soft-delete the current account (archive). Logs the user out on success. */
  deleteAccount: () => Promise<void>;
  /** Authenticated fetch against the API. Auto-refreshes the access token once on 401. */
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turn an API error response into a human-readable Error. */
async function toError(res: Response): Promise<Error> {
  try {
    const body = (await res.json()) as { message?: string; errors?: { message: string }[] };
    if (body.errors?.length) return new Error(body.errors.map((e) => e.message).join(', '));
    if (body.message) return new Error(body.message);
  } catch {
    /* fall through */
  }
  return new Error(`Request failed (${res.status})`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const tokenRef = useRef<string | null>(null);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string };
      tokenRef.current = data.accessToken;
      return true;
    } catch {
      return false;
    }
  }, []);

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const run = () =>
        fetch(`${BASE}${path}`, {
          ...init,
          credentials: 'include',
          headers: {
            ...(init.body ? { 'Content-Type': 'application/json' } : {}),
            ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
            ...init.headers,
          },
        });
      let res = await run();
      if (res.status === 401 && (await refresh())) res = await run();
      return res;
    },
    [refresh],
  );

  const loadProfile = useCallback(async () => {
    const res = await authFetch('/users/me');
    if (!res.ok) {
      setUser(null);
      setStatus('anon');
      return;
    }
    const u = (await res.json()) as User;
    setUser({ id: u.id, email: u.email, displayName: u.displayName });
    setStatus('authed');
  }, [authFetch]);

  // Bootstrap: try the refresh cookie to restore a session on first load.
  useEffect(() => {
    void (async () => {
      if (await refresh()) await loadProfile();
      else setStatus('anon');
    })();
  }, [refresh, loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await toError(res);
    const data = (await res.json()) as { user: User; accessToken: string };
    tokenRef.current = data.accessToken;
    setUser(data.user);
    setStatus('authed');
  }, []);

  const register = useCallback(
    async (email: string, displayName: string, password: string) => {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, password }),
      });
      if (!res.ok) throw await toError(res);
      const data = (await res.json()) as { user: User; accessToken: string };
      tokenRef.current = data.accessToken;
      setUser(data.user);
      setStatus('authed');
    },
    [],
  );

  const logout = useCallback(async () => {
    await authFetch('/auth/logout', { method: 'POST' }).catch(() => undefined);
    tokenRef.current = null;
    setUser(null);
    setStatus('anon');
  }, [authFetch]);

  const deleteAccount = useCallback(async () => {
    const res = await authFetch('/auth/account', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete account');
    tokenRef.current = null;
    setUser(null);
    setStatus('anon');
  }, [authFetch]);

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, logout, deleteAccount, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
