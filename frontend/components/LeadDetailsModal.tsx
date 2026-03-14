"use client";

import { useState } from "react";
import { Lead } from "../lib/types";

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange?: (lead: Lead, newStatus: string) => void;
  onDelete?: (lead: Lead) => Promise<string | null>;
}

const STATUS_OPTIONS = [
  "Novo lead",
  "Contato feito",
  "Proposta enviada",
  "Negociando",
  "Fechado",
  "Perdido"
];

const STATUS_COLORS: Record<string, string> = {
  "Novo lead": "bg-blue-500/20 text-blue-400",
  "Contato feito": "bg-yellow-500/20 text-yellow-400",
  "Proposta enviada": "bg-purple-500/20 text-purple-400",
  "Negociando": "bg-[var(--accent)]/20 text-[var(--accent)]",
  "Fechado": "bg-emerald-500/20 text-emerald-400",
  "Perdido": "bg-red-500/20 text-red-400"
};

export function LeadDetailsModal({ lead, onClose, onStatusChange, onDelete }: LeadDetailsModalProps) {
  if (!lead) return null;

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [approachMessage, setApproachMessage] = useState("");

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(`Excluir "${lead.company_name}"?`)) return;
    setDeleting(true);
    setDeleteError(null);
    const error = await onDelete(lead);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
    }
  };

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
              <span className={`mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[lead.status] ?? "bg-white/10 text-white"}`}>
                {lead.status}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">{lead.company_name}</h2>
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
        <div className="max-h-[70vh] overflow-y-auto p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Contact */}
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">Contato</h4>
                  {lead.phone && (
                    <button
                      onClick={() => {
                        const waNumber = lead.phone!.replace(/\D/g, '');
                        const waUrl = `https://wa.me/55${waNumber.startsWith('55') ? waNumber.slice(2) : waNumber}?text=${encodeURIComponent(approachMessage)}`;
                        window.open(waUrl, '_blank');
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-green-400 hover:text-green-300 transition"
                    >
                      Enviar WhatsApp 💬
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg shadow-sm">📞</span>
                    <div>
                      <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">Telefone</p>
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-white hover:text-[var(--accent)] transition-colors font-medium"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <p className="text-[var(--ink-muted)] text-sm">Não informado</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg shadow-sm">📧</span>
                    <div>
                      <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">Email</p>
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-white hover:text-[var(--accent)] transition-colors font-medium truncate max-w-[200px] block"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        <p className="text-[var(--ink-muted)] text-sm">Não informado</p>
                      )}
                    </div>
                  </div>

                  {lead.phone && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-3">Mensagem de Abordagem</p>
                      <textarea
                        value={approachMessage}
                        onChange={(e) => setApproachMessage(e.target.value)}
                        placeholder="Olá, vi sua empresa..."
                        className="w-full min-h-[100px] bg-transparent text-sm text-white placeholder:text-white/20 outline-none resize-none"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setApproachMessage(`Olá! Vi que a ${lead.company_name} está em destaque. Gostaria de apresentar uma proposta de expansão. Podemos conversar?`)}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-medium text-[var(--ink-muted)] hover:bg-white/10 hover:text-white transition"
                        >
                          Template 1
                        </button>
                        <button
                          onClick={() => setApproachMessage(`Olá, sou da Prospect e notei que a ${lead.company_name} tem um grande potencial. Gostaria de saber mais sobre seus serviços.`)}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-medium text-[var(--ink-muted)] hover:bg-white/10 hover:text-white transition"
                        >
                          Template 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Status & Notes */}
            <div className="space-y-6">
              <section>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">Status do Pipeline</h4>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onStatusChange?.(lead, s)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold text-left transition-all ${
                        lead.status === s
                          ? (STATUS_COLORS[s] ?? "bg-white/10 text-white") + " ring-1 ring-current"
                          : "bg-white/5 text-[var(--ink-muted)] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {deleteError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
                  NÃ£o foi possÃ­vel excluir: {deleteError}
                </div>
              )}

              {lead.notes && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">Notas</h4>
                  <div className="rounded-2xl bg-white/5 border border-white/5 p-4 text-sm text-[var(--ink-muted)] leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </div>
                </section>
              )}

              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">Datas</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--ink-muted)]">Criado em</span>
                    <span className="text-white">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ink-muted)]">Atualizado em</span>
                    <span className="text-white">{new Date(lead.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-white/5 px-8 py-5">
          <div className="flex items-center justify-between">
            {onDelete ? (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir lead"}
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-[var(--ink-muted)] hover:bg-white/5 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
