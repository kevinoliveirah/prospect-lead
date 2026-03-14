"use client";

import { Company, SocialLinks } from "../lib/types";

interface CompanyDetailsModalProps {
  company: Company | null;
  onClose: () => void;
  onSave?: (c: Company) => void;
  loadingDetails?: boolean;
  detailsError?: string | null;
}

const SOCIAL_CONFIG: Array<{ key: keyof SocialLinks; label: string; icon: string; color: string }> = [
  { key: 'whatsapp',  label: 'WhatsApp',  icon: '💬', color: 'text-green-400 hover:text-green-300' },
  { key: 'instagram', label: 'Instagram', icon: '📷', color: 'text-pink-400 hover:text-pink-300' },
  { key: 'facebook',  label: 'Facebook',  icon: '👍', color: 'text-blue-400 hover:text-blue-300' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: '💼', color: 'text-sky-400 hover:text-sky-300' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️', color: 'text-red-400 hover:text-red-300' },
  { key: 'tiktok',    label: 'TikTok',    icon: '🎵', color: 'text-white hover:text-gray-300' },
  { key: 'pinterest', label: 'Pinterest', icon: '📌', color: 'text-red-300 hover:text-red-200' },
  { key: 'twitter',   label: 'Twitter/X', icon: '🐦', color: 'text-sky-300 hover:text-sky-200' },
];

export function CompanyDetailsModal({ company, onClose, onSave, loadingDetails, detailsError }: CompanyDetailsModalProps) {
  if (!company) return null;

  const hasSocial = company.social && Object.values(company.social).some(Boolean);
  const mapsQuery =
    (company.latitude && company.longitude)
      ? `${company.latitude},${company.longitude}`
      : (company.address || company.city || company.name);
  const mapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-white/5 bg-white/5 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                company.business_type === 'B2B' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 
                company.business_type === 'B2C' ? 'bg-blue-500/20 text-blue-400' :
                'bg-white/10 text-white/70'
              }`}>
                {company.business_type || 'Empresa'}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">{company.name}</h2>
              {company.category && (
                <p className="mt-1 text-sm text-[var(--ink-muted)] capitalize">{company.category.replace(/_/g, ' ')}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-[var(--ink-muted)] hover:bg-white/10 hover:text-white transition-all shadow-sm flex-shrink-0"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-8 space-y-8">
          {detailsError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
              Nao foi possivel carregar detalhes: {detailsError}
            </div>
          )}
          {/* Contact */}
          <section>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">📋 Contato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">Telefone</p>
                  {company.phone ? (
                    <a href={`tel:${company.phone}`} className="text-white font-medium hover:text-[var(--accent)] transition-colors">
                      {company.phone}
                    </a>
                  ) : <p className="text-[var(--ink-muted)] text-sm">Não informado</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="text-2xl">🌐</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">Website</p>
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors block truncate text-sm"
                    >
                      {company.website}
                    </a>
                  ) : <p className="text-[var(--ink-muted)] text-sm">Não informado</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5 md:col-span-2">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">Endereço</p>
                  <p className="text-white text-sm leading-relaxed">{company.address || company.city || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media */}
          {hasSocial && (
            <section>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">📱 Redes Sociais</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SOCIAL_CONFIG.map(({ key, label, icon, color }) => {
                  const url = company.social?.[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-2 rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 hover:scale-[1.02] ${color}`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {!hasSocial && (
            <div className="rounded-2xl bg-white/5 border border-dashed border-white/10 p-5 text-center text-xs text-[var(--ink-muted)]">
              Redes sociais não encontradas no site desta empresa.
            </div>
          )}

          {/* Market intel */}
          <section>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">📊 Inteligência de Mercado</h4>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mb-1">Faturamento Estimado</p>
                <p className="text-base font-bold text-emerald-400">{company.revenue_estimate || 'Sob consulta'}</p>
              </div>
              {company.rating && (
                <div>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mb-1">Avaliação Google</p>
                  <p className="text-base font-bold text-amber-400">★ {company.rating.toFixed(1)}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-white/5 px-8 py-5 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-[var(--ink-muted)] hover:bg-white/5 transition-colors"
          >
            Fechar
          </button>
          {onSave && (
            <button
              onClick={() => { onSave(company); onClose(); }}
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              📂 Salvar como Lead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
