"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../lib/types";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  setAuth: (auth: { user: User; token: string }) => void;
  logout: () => void;
};

const STORAGE_KEY = "mapa_b2b_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      setState({ user: parsed.user, token: parsed.token, loading: false });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  const setAuth = (auth: { user: User; token: string }) => {
    setState({ user: auth.user, token: auth.token, loading: false });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    }
  };

  const logout = () => {
    setState({ user: null, token: null, loading: false });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      setAuth,
      logout
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
