"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { X, Menu, LayoutDashboard, Database, Map as MapIcon, LogOut } from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Database },
  { href: "/mapa", label: "Mapa", icon: MapIcon }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--ink)]">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/5 bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm text-[var(--ink-muted)]">Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="border-b border-white/5 bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="group flex items-center gap-3 transition hover:opacity-80">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1 shadow-sm">
              <Image
                src="/logo.png"
                alt="Prospect Lead Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <h1 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors">Prospect Lead</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-white/5 text-[var(--ink-muted)] hover:bg-white/10"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[var(--ink-muted)] md:hidden transition hover:bg-white/10 hover:text-white"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:flex items-center gap-3 text-sm">
            <div>
              <p className="font-medium">{user?.name ?? "Usuario"}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                {user?.company ?? "Conta demo"}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)] transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-white/5 bg-[var(--surface)] p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    pathname?.startsWith(item.href)
                      ? "bg-[var(--accent)] text-white"
                      : "bg-white/5 text-[var(--ink-muted)] hover:bg-white/10"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="font-medium">{user?.name ?? "Usuario"}</p>
                <p className="text-xs text-[var(--ink-muted)] mb-4">{user?.company ?? "Conta demo"}</p>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]"
                >
                  Sair
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
