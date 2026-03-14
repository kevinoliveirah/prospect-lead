"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { apiFetch } from "../../../lib/api";
import type { User } from "../../../lib/types";

type RegisterResponse = {
  user: User;
  token: string;
};

const HIGHLIGHTS = [
  "Mapa para buscar empresas por segmento e cidade",
  "Salvar empresas como leads e organizar status",
  "Exportar resultados e leads em CSV"
];

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();
  
  if (normalized.includes("email_in_use")) {
    return {
      title: "Email ja cadastrado",
      detail: "Ja existe uma conta com este email. Tente fazer login."
    };
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return {
      title: "Sem conexao",
      detail: "Verifique sua internet ou tente novamente em instantes."
    };
  }

  return {
    title: "Nao foi possivel criar conta",
    detail: "Ocorreu um erro no cadastro. Tente novamente."
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorDetail, setErrorDetail] = useState<{ title: string; detail: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorDetail(null);
    try {
      const payload = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password
        })
      });
      setAuth(payload);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorDetail(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-12 text-[var(--ink)]">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <section className="rounded-3xl border border-white/10 bg-[var(--surface)]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta</h1>
            <p className="text-sm text-[var(--ink-muted)]">Acesse o mapa, salve leads e exporte para usar no seu dia a dia.</p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <ul className="grid gap-2 text-sm text-[var(--ink-muted)]">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-left">
                  <span className="mt-0.5 text-[var(--accent)]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)] ml-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none ring-[var(--accent)]/50 focus:ring-2 transition-all"
                placeholder="Seu nome completo"
              />
            </div>

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
                placeholder="voce@empresa.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)] ml-1">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none ring-[var(--accent)]/50 focus:ring-2 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {errorDetail && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300 animate-in fade-in slide-in-from-top-2">
                <p className="font-bold text-red-200">{errorDetail.title}</p>
                <p className="mt-1 opacity-80">{errorDetail.detail}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--accent)] py-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Minha Conta"}
            </button>
          </form>

          <footer className="mt-8 text-center space-y-4">
            <p className="text-sm text-[var(--ink-muted)]">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-bold text-[var(--accent)] hover:underline decoration-2 underline-offset-4">
                Fazer login
              </Link>
            </p>
            <Link href="/" className="inline-block text-xs font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:text-white transition-colors">
              ← Voltar ao início
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
