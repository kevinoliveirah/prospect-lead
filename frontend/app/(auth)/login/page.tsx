"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { apiFetch } from "../../../lib/api";
import type { User } from "../../../lib/types";
import Image from "next/image";

type LoginResponse = {
  user: User;
  token: string;
};

const PENDING_SEARCH_KEY = "prospect_lead_pending_search";

function mapLoginError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid_credentials")) {
    return {
      title: "Nao foi possivel entrar",
      detail: "Email ou senha incorretos. Confira os dados e tente novamente."
    };
  }

  if (normalized.includes("unauthorized")) {
    return {
      title: "Sessao invalida",
      detail: "Sua sessao expirou ou nao e valida. Faca login novamente."
    };
  }

  if (normalized.includes("request_failed_429")) {
    return {
      title: "Muitas tentativas",
      detail: "Aguarde alguns minutos e tente de novo."
    };
  }

  if (normalized.includes("request_failed_500") || normalized.includes("internal_server_error")) {
    return {
      title: "Servidor indisponivel",
      detail: "O servidor nao respondeu. Tente novamente em instantes."
    };
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return {
      title: "Sem conexao com o servidor",
      detail: "Verifique sua internet ou se o backend esta ligado."
    };
  }

  if (normalized.includes("request_failed_") || normalized.includes("erro_desconhecido")) {
    return {
      title: "Nao foi possivel entrar",
      detail: "Ocorreu um erro inesperado. Tente novamente."
    };
  }

  return {
    title: "Nao foi possivel entrar",
    detail: message
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetail, setErrorDetail] = useState<{ title: string; detail: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorDetail(null);
    try {
      const payload = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuth(payload);
      
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(PENDING_SEARCH_KEY);
        if (raw) {
          try {
            const data = JSON.parse(raw) as { q?: string; city?: string; radius_km?: string };
            window.localStorage.removeItem(PENDING_SEARCH_KEY);
            const params = new URLSearchParams();
            if (data.q) params.set("q", data.q);
            if (data.city) params.set("city", data.city);
            if (data.radius_km) params.set("radius_km", data.radius_km);
            params.set("auto", "1");
            router.push(`/mapa?${params.toString()}`);
            return;
          } catch {
            window.localStorage.removeItem(PENDING_SEARCH_KEY);
          }
        }
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorDetail(mapLoginError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-12 text-[var(--ink)]">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <section className="rounded-3xl border border-white/10 bg-[var(--surface)]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo(a)</h1>
            <p className="text-sm text-[var(--ink-muted)]">Acesse sua conta para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)] ml-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none ring-[var(--accent)]/50 focus:ring-2 transition-all"
                placeholder="Seu email cadastrado"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                  Senha
                </label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-5 pr-20 py-3.5 text-sm text-white placeholder:text-white/20 outline-none ring-[var(--accent)]/50 focus:ring-2 transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {errorDetail && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300 animate-in fade-in slide-in-from-top-2">
                <p className="font-bold text-red-200">{errorDetail.title}</p>
                <p className="mt-1 opacity-80">{errorDetail.detail}</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[var(--accent)] py-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Acessar Plataforma"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@prospect.com");
                  setPassword("prospect123");
                  setTimeout(() => {
                    const form = document.querySelector("form");
                    if (form) form.requestSubmit();
                  }, 150);
                }}
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-3 text-xs font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white"
              >
                Acesso Rápido (Demo)
              </button>
            </div>
          </form>

          <footer className="mt-8 text-center space-y-4">
            <p className="text-sm text-[var(--ink-muted)]">
              Ainda não tem conta?{" "}
              <Link href="/register" className="font-bold text-[var(--accent)] hover:underline decoration-2 underline-offset-4">
                Criar conta
              </Link>
            </p>
            <div className="flex flex-col gap-4 items-center">
              <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:text-white transition-colors">
                ← Voltar ao início
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
              >
                Limpar dados do navegador
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
