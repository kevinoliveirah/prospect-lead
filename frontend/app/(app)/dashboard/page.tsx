"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { DashboardSummary, Lead } from "../../../lib/types";
import { useAuth } from "../../../components/AuthProvider";
import { LeadDetailsModal } from "../../../components/LeadDetailsModal";

const STATUS_COLORS: Record<string, string> = {
  "Novo lead": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Contato feito": "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
  "Proposta enviada": "bg-purple-500/10 text-purple-400 ring-purple-500/20",
  "Negociando": "bg-[var(--accent)]/10 text-[var(--accent)] ring-[var(--accent)]/20",
  "Fechado": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  "Perdido": "bg-red-500/10 text-red-400 ring-red-500/20"
};

const STATUS_OPTIONS = ["Novo lead", "Contato feito", "Proposta enviada", "Negociando", "Fechado", "Perdido"];

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [summaryData, leadsData] = await Promise.all([
        apiFetch<DashboardSummary>("/dashboard/summary", {}, token),
        apiFetch<Lead[]>("/leads", {}, token)
      ]);
      setSummary(summaryData);
      setLeads(leadsData || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    if (!token) return;
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    try {
      await apiFetch(`/leads/${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      }, token);
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Empresa", "Telefone", "Email", "Website", "Status", "Criado em"];
    const rows = leads.map(l => [
      l.company_name,
      l.phone || "",
      l.email || "",
      l.website || "",
      l.status,
      new Date(l.created_at).toLocaleDateString("pt-BR")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_prospect_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !token) return;
    if (!confirm(`Excluir ${selectedIds.size} leads selecionados?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => 
        apiFetch(`/leads/${id}`, { method: "DELETE" }, token)
      ));
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      setError("Erro ao excluir leads em massa.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone?.includes(searchQuery)
  );

  const handleDeleteLead = async (lead: Lead): Promise<string | null> => {
    if (!token) return "unauthorized";
    try {
      await apiFetch(`/leads/${lead.id}`, { method: "DELETE" }, token);
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setSelectedLead(null);
      await fetchData();
      return null;
    } catch (err) {
      console.error("Failed to delete lead:", err);
      const message = err instanceof Error ? err.message : "erro_desconhecido";
      setError(message);
      return message;
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Panorama dos seus leads</h1>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">Total de Leads</p>
          <p className="mt-3 text-4xl font-bold text-white">{loading ? "--" : summary?.total ?? 0}</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">Contatos ativos no pipeline.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">Status Líder</p>
          <p className="mt-3 text-2xl font-bold text-white">
            {loading ? "--" : summary?.by_status?.[0]?.status ?? "Sem dados"}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {summary?.by_status?.[0]?.count ? `${summary.by_status[0].count} leads neste status.` : "Comece a prospectar!"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">Última Atividade</p>
          <p className="mt-3 text-xl font-bold text-white truncate">
            {loading ? "--" : summary?.recent?.[0]?.company_name ?? "Sem leads"}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {summary?.recent?.[0]?.status ?? "Atualize seu pipeline."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[var(--surface)] px-5 py-3 text-sm text-white placeholder:text-[var(--ink-muted)] outline-none ring-[var(--accent)] focus:ring-2 transition-all shadow-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg grayscale opacity-40">🔍</span>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition flex items-center gap-2"
            >
              🗑️ Excluir ({selectedIds.size})
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition flex items-center gap-2 shadow-sm"
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl border border-white/10 bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="border-b border-white/5 bg-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              title="Selecionar todos"
              aria-label="Selecionar todos os leads"
              checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(new Set(filteredLeads.map(l => l.id)));
                } else {
                  setSelectedIds(new Set());
                }
              }}
              className="h-4 w-4 rounded border-white/10 bg-black/20 accent-[var(--accent)]"
            />
            <h3 className="font-semibold text-white">Todos os Leads</h3>
          </div>
          <span className="text-xs text-[var(--ink-muted)]">{filteredLeads.length} contatos encontrados</span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-[var(--ink-muted)] text-sm">Carregando...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="px-6 py-12 text-center text-[var(--ink-muted)] text-sm">
            <p className="text-3xl mb-3">📂</p>
            <p>{searchQuery ? "Nenhum lead encontrado para essa busca." : "Nenhum lead salvo ainda. Vá ao mapa e salve empresas."}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLeads.map((lead) => {
              const waNumber = lead.phone?.replace(/\D/g, '');
              const waUrl = waNumber && waNumber.length >= 10
                ? `https://wa.me/55${waNumber.startsWith('55') ? waNumber.slice(2) : waNumber}`
                : null;

              return (
                <div
                  key={lead.id}
                  className={`group flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition table-row-custom ${selectedIds.has(lead.id) ? 'bg-white/5' : ''}`}
                >
                  <div className="pl-2">
                    <input
                      type="checkbox"
                      title="Selecionar lead"
                      aria-label={`Selecionar ${lead.company_name}`}
                      checked={selectedIds.has(lead.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(lead.id);
                        else next.delete(lead.id);
                        setSelectedIds(next);
                      }}
                      className="h-4 w-4 rounded border-white/10 bg-black/20 accent-[var(--accent)] cursor-pointer"
                    />
                  </div>
                  {/* Company info — clickable */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <p className="font-semibold text-white truncate group-hover:text-[var(--accent)] transition-colors text-sm">
                      {lead.company_name}
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] mt-0.5 flex flex-wrap gap-2">
                      {lead.phone && <span>📞 {lead.phone}</span>}
                      {lead.email && <span>✉️ {lead.email}</span>}
                      {!lead.phone && !lead.email && <span>Sem contato salvo</span>}
                    </p>
                  </div>

                  {/* Inline status selector */}
                   <select
                    value={lead.status}
                    title="Mudar status"
                    aria-label={`Mudar status de ${lead.company_name}`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(lead, e.target.value);
                    }}
                    className={`hidden sm:block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 bg-transparent cursor-pointer outline-none appearance-none text-center flex-shrink-0 transition-all hover:opacity-80 ${STATUS_COLORS[lead.status] || 'text-white border-white/20'}`}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-[#1a1a2e] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* WhatsApp */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition text-sm"
                      >
                        💬
                      </a>
                    )}
                    {/* Email */}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        title="Enviar Email"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition text-sm"
                      >
                        ✉️
                      </a>
                    )}
                    {/* Details */}
                    <button
                      onClick={() => setSelectedLead(lead)}
                      title="Ver detalhes"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[var(--ink-muted)] hover:bg-white/10 hover:text-white transition text-sm"
                    >
                      →
                    </button>
                    {/* Delete */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Remover "${lead.company_name}" dos seus leads?`)) return;
                        await handleDeleteLead(lead);
                      }}
                      title="Excluir lead"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Breakdown */}
      {(summary?.by_status?.length ?? 0) > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="font-semibold text-white mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            {summary!.by_status.map((item) => {
              const total = summary!.total || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white">{item.status}</span>
                    <span className="text-[var(--ink-muted)]">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-[var(--accent)] opacity-80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <LeadDetailsModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteLead}
      />
    </section>
  );
}
