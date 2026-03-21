"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { Lead, LeadNote } from "../../../lib/types";
import { useAuth } from "../../../components/AuthProvider";

type ProspectResponse = {
  source: string;
  suggestion: string;
};

export default function CrmPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const STATUS_COLORS: Record<string, string> = {
    "Novo lead": "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "Contato": "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    "Proposta": "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "Negociacao": "bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]",
    "Fechado": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "Perdido": "bg-red-500/10 border-red-500/20 text-red-400"
  };

  const [form, setForm] = useState({
    company_name: "",
    address: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    status: "Novo lead",
    notes: ""
  });

  const [noteInputByLead, setNoteInputByLead] = useState<Record<string, string>>({});
  const [notesByLead, setNotesByLead] = useState<Record<string, LeadNote[]>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});

  const [aiInput, setAiInput] = useState({
    company_name: "",
    category: "",
    notes: ""
  });
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const uniqueStatuses = useMemo(() => {
    const values = new Set<string>();
    leads.forEach((lead) => values.add(lead.status));
    return Array.from(values);
  }, [leads]);

  const COLUMNS = Array.from(new Set(["Novo lead", "Contato", "Proposta", "Negociacao", "Fechado", "Perdido", ...uniqueStatuses]));

  const loadLeads = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Lead[]>("/leads", {}, token);
      setLeads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [token]);

  const handleCreateLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setMessage(null);
    try {
      const payload = {
        company_name: form.company_name,
        address: form.address || undefined,
        category: form.category || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        status: form.status || "Novo lead",
        notes: form.notes || undefined
      };
      const newLead = await apiFetch<Lead>(
        "/leads",
        { method: "POST", body: JSON.stringify(payload) },
        token
      );
      setLeads((prev) => [newLead, ...prev]);
      setForm({
        company_name: "", address: "", category: "", phone: "", email: "", website: "", status: "Novo lead", notes: ""
      });
      setMessage("Lead criado com sucesso.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
    }
  };

  const handleStatusDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId || !token) return;
    
    const lead = leads.find((l) => String(l.id) === leadId);
    if (!lead || lead.status === newStatus) return;

    setLeads((prev) =>
      prev.map((l) => (String(l.id) === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      await apiFetch<Lead>(
        `/leads/${leadId}`,
        { method: "PATCH", body: JSON.stringify({ status: newStatus }) },
        token
      );
      setMessage(`Lead movido para: ${newStatus}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
      loadLeads();
    }
  };

  const toggleNotes = async (leadId: string) => {
    const isOpen = notesOpen[leadId];
    setNotesOpen((prev) => ({ ...prev, [leadId]: !isOpen }));
    if (!isOpen && !notesByLead[leadId]) {
      if (!token) return;
      try {
        const data = await apiFetch<LeadNote[]>(
          `/leads/${leadId}/notes`,
          {},
          token
        );
        setNotesByLead((prev) => ({ ...prev, [leadId]: data }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "erro_desconhecido";
        setError(message);
      }
    }
  };

  const addNote = async (leadId: string, note: string) => {
    if (!token || !note.trim()) return;
    try {
      const created = await apiFetch<LeadNote>(
        `/leads/${leadId}/notes`,
        { method: "POST", body: JSON.stringify({ note }) },
        token
      );
      setNotesByLead((prev) => ({
        ...prev,
        [leadId]: [created, ...(prev[leadId] ?? [])]
      }));
      setNoteInputByLead((prev) => ({ ...prev, [leadId]: "" }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
    }
  };

  const generateSuggestion = async () => {
    if (!token) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const payload = {
        company_name: aiInput.company_name,
        category: aiInput.category || undefined,
        notes: aiInput.notes || undefined
      };
      const data = await apiFetch<ProspectResponse>(
        "/ai/prospect",
        { method: "POST", body: JSON.stringify(payload) },
        token
      );
      setAiSuggestion(data.suggestion);
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="space-y-8 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
            CRM
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Quadro Kanban
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-[var(--surface)]/80 px-4 py-2 text-sm text-[var(--ink-muted)]">
          {loading ? "Atualizando..." : `${leads.length} leads`}
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-900/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-orange-900/30 bg-orange-950/20 px-4 py-3 text-sm text-orange-400">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleCreateLead}
          className="rounded-2xl border border-white/10 bg-[var(--surface)]/80 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold">Adicionar lead</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Empresa
              <input
                required
                title="Nome da empresa"
                value={form.company_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company_name: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Nome da empresa"
              />
            </label>
            <label className="text-sm">
              Segmento
              <input
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Ex: Metalurgia, Varejo..."
              />
            </label>
            <label className="text-sm md:col-span-2">
              Endereço (para pin no mapa 📍)
              <input
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Ex: Av. Paulista, 1000, São Paulo, SP"
              />
            </label>
            <label className="text-sm">
              Telefone
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="(11) 90000-0000"
              />
            </label>
            <label className="text-sm">
              Email
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="contato@empresa.com"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Website
              <input
                value={form.website}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, website: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="https://empresa.com"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Salvar lead
          </button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold">IA de Prospecção</h3>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Gere uma mensagem consultiva com IA para abordar seus leads.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
            <label className="block text-sm">
              Empresa
              <input
                value={aiInput.company_name}
                onChange={(event) =>
                  setAiInput((prev) => ({ ...prev, company_name: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Ex: TechStore"
              />
            </label>
            <label className="block text-sm">
              Segmento
              <input
                value={aiInput.category}
                onChange={(event) =>
                  setAiInput((prev) => ({ ...prev, category: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Ex: Varejo"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Observações/Contexto
              <textarea
                value={aiInput.notes}
                onChange={(event) =>
                  setAiInput((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="mt-2 min-h-[60px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-2"
                placeholder="Breve contexto do lead"
              />
            </label>
          </div>
          <button
            onClick={generateSuggestion}
            disabled={aiLoading || !aiInput.company_name}
            className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {aiLoading ? "Gerando..." : "Gerar mensagem"}
          </button>
          {aiSuggestion && (
            <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-[var(--ink-muted)] flex-1 overflow-auto max-h-[200px] whitespace-pre-wrap">
              {aiSuggestion}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map((status) => {
          const columnLeads = leads.filter((l) => l.status === status);
          return (
            <div
              key={status}
              className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start flex flex-col gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-4 shadow-lg overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleStatusDrop(e, status)}
            >
              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]?.split(' ')[2] || 'bg-white'}`} />
                  <h4 className="font-semibold text-sm">{status}</h4>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-[var(--ink-muted)]">
                  {columnLeads.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 min-h-[150px] rounded-xl bg-black/10 p-2 overflow-y-auto">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("leadId", String(lead.id))}
                    className="rounded-xl border border-white/10 bg-[var(--surface)] p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--accent)]/50 transition relative group"
                  >
                    <h5 className="font-medium text-white">{lead.company_name}</h5>
                    
                    <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
                       {lead.email && <p>{lead.email}</p>}
                       {lead.phone && <p>{lead.phone}</p>}
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => toggleNotes(lead.id)}
                        className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)] hover:text-white transition"
                      >
                        {notesOpen[lead.id] ? "Ocultar" : "Notas"}
                      </button>
                    </div>

                    {notesOpen[lead.id] && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3 cursor-default">
                        <div className="space-y-2 text-xs text-[var(--ink-muted)] max-h-32 overflow-y-auto pr-1">
                          {notesByLead[lead.id] ? (
                            notesByLead[lead.id].map((note) => (
                              <div key={note.id} className="rounded-md bg-black/20 p-2">
                                {note.note}
                              </div>
                            ))
                          ) : (
                            <p>Carregando...</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={noteInputByLead[lead.id] ?? ""}
                            onChange={(e) =>
                              setNoteInputByLead((prev) => ({ ...prev, [lead.id]: e.target.value }))
                            }
                            className="flex-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white placeholder:text-white/40 shadow-sm outline-none ring-[var(--accent)] focus:ring-1"
                            placeholder="Nova nota"
                          />
                          <button
                            onClick={() => addNote(lead.id, noteInputByLead[lead.id] ?? "")}
                            className="rounded-md bg-white/10 hover:bg-[var(--accent)] hover:text-white px-2 py-1 text-xs font-medium text-white transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {columnLeads.length === 0 && (
                  <div className="flex h-full items-center justify-center p-4">
                    <p className="text-xs text-[var(--ink-muted)] text-center opacity-50">Arraste um card e solte aqui</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
