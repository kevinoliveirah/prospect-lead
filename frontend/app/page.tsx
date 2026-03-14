"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Unbounded, Sora } from "next/font/google";
import { useAuth } from "../components/AuthProvider";
import { CheckCircle, Search, ArrowRight, Zap, BarChart3, Cloud, Filter, Download } from "lucide-react";
import { CityAutocomplete } from "../components/CityAutocomplete";

const heading = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const body = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

const FEATURES = [
  {
    title: "Mapa com filtros",
    text: "Busque empresas por segmento, cidade, raio e limite de resultados.",
    icon: <Filter className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Classificação B2B/B2C",
    text: "A IA separa indústrias de varejo para você priorizar.",
    icon: <BarChart3 className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Salvar leads e etapas",
    text: "Envie empresas para o painel, mova status e registre notas.",
    icon: <CheckCircle className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Exportação CSV",
    text: "Baixe resultados do mapa ou do pipeline para trabalhar no Excel.",
    icon: <Download className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Detalhes e contatos",
    text: "Telefone, site e redes sociais quando disponíveis no banco público.",
    icon: <Cloud className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Histórico de buscas",
    text: "Repita consultas recentes em um clique direto do mapa.",
    icon: <Search className="text-[var(--accent)]" size={20} />
  },
  {
    title: "Abordagem com IA",
    text: "Gere uma mensagem inicial para cada lead dentro do CRM.",
    icon: <Zap className="text-[var(--accent)]" size={20} />
  }
];

const FLOW = [
  {
    title: "Busque no mapa",
    text: "Defina segmento, cidade, raio e limite. O mapa retorna empresas públicas."
  },
  {
    title: "Revise e salve",
    text: "Abra detalhes, veja contatos e salve como lead com um clique."
  },
  {
    title: "Gerencie e exporte",
    text: "Atualize status, registre notas, gere mensagem com IA e exporte CSV."
  }
];

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const [segment, setSegment] = useState("");
  const [city, setCity] = useState("");

  const handleQuickSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window !== "undefined") {
      const payload = {
        q: segment.trim(),
        city: city.trim()
      };
      window.localStorage.setItem("prospect_lead_pending_search", JSON.stringify(payload));
      const rawAuth = window.localStorage.getItem("mapa_b2b_auth");
      if (rawAuth) {
        const params = new URLSearchParams();
        if (payload.q) params.set("q", payload.q);
        if (payload.city) params.set("city", payload.city);
        params.set("auto", "1");
        router.push(`/mapa?${params.toString()}`);
        return;
      }
    }
    router.push("/login");
  };

  return (
    <main className={`min-h-screen bg-[var(--bg)] text-[var(--ink)] ${body.className}`}>
      <section className="relative overflow-hidden">
        <header className="relative z-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <Link href="/" className="group flex items-center gap-3 transition hover:opacity-80">
              <h1 className="text-xl font-bold text-white transition-colors group-hover:text-[var(--accent)]">
                Prospect Lead
              </h1>
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              <Link href="#recursos" className="rounded-full border border-white/10 px-4 py-2 hover:text-white hover:bg-white/5 transition">
                Recursos
              </Link>
              <Link href="#fluxo" className="rounded-full border border-white/10 px-4 py-2 hover:text-white hover:bg-white/5 transition">
                Como funciona
              </Link>
              <Link href="#cta" className="rounded-full border border-white/10 px-4 py-2 hover:text-white hover:bg-white/5 transition">
                Criar conta
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {token ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[var(--accent)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-[var(--accent)]/30 transition hover:brightness-110"
                >
                  Ir para o sistema
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/10 transition"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-[var(--accent)]/30"
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-[var(--accent-2)]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(249,115,22,0.12),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div className="animate-fade-up">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--ink-muted)] mb-6">
                Prospect Lead
              </p>
              <h1 className={`mt-6 text-4xl leading-tight md:text-5xl ${heading.className}`}>
                Prospecção local com dados públicos que você consegue usar agora.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-[var(--ink-muted)]">
                Busque empresas por segmento e cidade, veja contatos disponíveis, salve como lead e exporte quando precisar.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-[var(--surface)]/80 p-5 shadow-sm backdrop-blur">
                <form
                  onSubmit={handleQuickSearch}
                  className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] items-end"
                >
                  <label className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                    Segmento
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                      placeholder="Ex: Indústrias de embalagens"
                      value={segment}
                      onChange={(event) => setSegment(event.target.value)}
                    />
                  </label>
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">Cidade</span>
                  <CityAutocomplete
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                      placeholder="Ex: Curitiba, PR"
                      value={city}
                      onChange={setCity}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/30 transition hover:brightness-110"
                  >
                    <Search size={18} />
                    Buscar
                  </button>
                </form>
                <p className="mt-3 text-xs text-[var(--ink-muted)]">
                  Resultados usam apenas dados públicos. Sem etapas extras nem cartão.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {token ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    Ir para o Painel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                    >
                      Iniciar agora
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/10"
                    >
                      Entrar
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="animate-fade-up rounded-3xl border border-white/10 bg-[var(--surface)]/80 p-6 shadow-lg backdrop-blur" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] uppercase tracking-[0.35em]">
                <span>Fluxo pronto</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold text-white">Mapa + Leads</span>
              </div>

              <div className="mt-6 space-y-3">
                {FEATURES.filter((_, index) => index < 4).map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="rounded-lg bg-[var(--accent)]/10 p-2 text-[var(--accent)]">
                      {feature.icon}
                    </div>
                    <div className="text-sm text-white">
                      <p className="font-semibold">{feature.title}</p>
                      <p className="mt-1 text-[var(--ink-muted)] text-xs leading-relaxed">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-muted)]">
                Buscas e leads ficam salvos na sua conta. Você pode exportar CSV a qualquer momento.
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--ink-muted)]">Recursos disponíveis</p>
            <h2 className={`mt-4 text-3xl ${heading.className}`}>O que já funciona hoje.</h2>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/10 transition"
          >
            Ver painel
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/10 bg-[var(--surface)]/70 p-6 transition hover:bg-[var(--surface)] hover:border-[var(--accent)]/30 group">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 group-hover:bg-[var(--accent)]/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-[var(--ink-muted)]">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fluxo" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--ink-muted)]">Como funciona</p>
            <h2 className={`mt-4 text-3xl ${heading.className}`}>Três passos que já estão disponíveis.</h2>
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              Use o mapa para encontrar empresas, salve como lead e acompanhe tudo no painel.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FLOW.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-[var(--surface)]/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Etapa {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-[var(--ink-muted)]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="rounded-3xl border border-white/10 bg-[var(--surface)]/80 p-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--ink-muted)]">Comece agora</p>
          <h2 className={`mt-4 text-3xl ${heading.className}`}>Use o mapa e o painel hoje.</h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Crie sua conta para buscar empresas, salvar leads e exportar CSV sem etapas extras.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/30 transition hover:brightness-110"
            >
              Criar conta
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-white/10 transition"
            >
              Ver exemplo
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            Dados públicos · Sem cartão de crédito
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-[1.3fr_1fr_1fr] text-sm text-[var(--ink-muted)]">
          <div>
            <p className={`text-lg text-white ${heading.className}`}>Prospect Lead</p>
            <p className="mt-4">
              Prospecção local com dados públicos organizados para o time comercial.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">Produto</p>
            <div className="mt-3 space-y-2">
              <p>Mapa</p>
              <p>Dashboard</p>
              <p>CRM</p>
              <p>Exportação CSV</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">Empresa</p>
            <div className="mt-3 space-y-2">
              <p>Sobre</p>
              <p>Privacidade</p>
              <p>Termos</p>
              <p>Contato</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
