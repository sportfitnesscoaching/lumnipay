"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Globe, Plus, CheckCircle2, Clock, Trash2, Link2, Copy, Check, ExternalLink } from "lucide-react";

interface DomainRow {
  id: string; domain: string; isVerified: boolean; enabled: boolean;
  verificationToken: string; createdAt: string;
  store: { id: string; name: string; slug: string | null } | null;
}
interface StoreOption { id: string; name: string; slug: string | null }

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newStoreId, setNewStoreId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    const [dr, sr] = await Promise.all([
      api.get<{ domains: DomainRow[] }>("/domains").catch(() => ({ domains: [] })),
      api.get<{ stores: StoreOption[] }>("/stores").catch(() => ({ stores: [] })),
    ]);
    setDomains(dr.domains);
    setStores(sr.stores);
  }

  useEffect(() => { load(); }, []);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/domains", { domain: newDomain, storeId: newStoreId || undefined });
      setNewDomain(""); setNewStoreId(""); setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  async function verify(id: string) {
    await api.patch(`/domains/${id}`, { action: "verify" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce domaine ?")) return;
    await api.delete(`/domains/${id}`);
    load();
  }

  async function assignStore(id: string, storeId: string) {
    await api.patch(`/domains/${id}`, { storeId: storeId || null });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Domaines personnalisés</h1>
          <p className="text-gray-500 text-sm">Associez vos domaines à vos stores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Ajouter un domaine
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Nouveau domaine</h2>
          <form onSubmit={addDomain} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de domaine</label>
              <input
                value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
                placeholder="shop.monsite.com" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Associer à un store (optionnel)</label>
              <select
                value={newStoreId} onChange={(e) => setNewStoreId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              >
                <option value="">— Aucun store —</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {loading ? "Ajout..." : "Ajouter"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 font-medium px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {domains.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Globe className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucun domaine configuré</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez un domaine pour personnaliser l&apos;URL de vos stores.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((d) => (
            <DomainCard key={d.id} d={d} stores={stores}
              copiedId={copiedId} setCopiedId={setCopiedId}
              onVerify={verify} onRemove={remove} onAssign={assignStore} />
          ))}
        </div>
      )}
    </div>
  );
}

function DomainCard({ d, stores, copiedId, setCopiedId, onVerify, onRemove, onAssign }: {
  d: DomainRow; stores: StoreOption[];
  copiedId: string | null; setCopiedId: (v: string | null) => void;
  onVerify: (id: string) => void; onRemove: (id: string) => void;
  onAssign: (id: string, storeId: string) => void;
}) {
  const txtRecord = `lumnipay-verify=${d.verificationToken}`;
  const txtName = `_lumnipay.${d.domain}`;
  const cnameValue = `custom.lumnipay.com`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${d.isVerified ? "bg-emerald-50" : "bg-amber-50"}`}>
            {d.isVerified
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <Clock className="w-5 h-5 text-amber-500" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
              {d.domain}
              {d.isVerified && d.enabled && (
                <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-500" />
                </a>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              {d.isVerified ? (
                <span className="text-emerald-600 font-medium">✓ Vérifié</span>
              ) : (
                <span className="text-amber-600 font-medium">En attente de vérification</span>
              )}
              {d.store && (
                <span className="text-gray-300">•</span>
              )}
              {d.store && (
                <span className="flex items-center gap-1 text-indigo-500">
                  <Link2 className="w-3 h-3" /> {d.store.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!d.isVerified && (
            <button onClick={() => onVerify(d.id)}
              className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors">
              Vérifier
            </button>
          )}
          <button onClick={() => onRemove(d.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DNS instructions */}
      {!d.isVerified && (
        <div className="border-t border-gray-100 px-6 py-4 bg-amber-50/50">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Entrées DNS à ajouter</p>
          <div className="space-y-2">
            {[
              { type: "TXT", name: txtName, value: txtRecord, id: `txt-${d.id}` },
              { type: "CNAME", name: d.domain, value: cnameValue, id: `cname-${d.id}` },
            ].map(({ type, name, value, id }) => (
              <div key={id} className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-xs">
                <span className="shrink-0 bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-md">{type}</span>
                <span className="text-gray-500 truncate min-w-0 flex-1">{name}</span>
                <span className="text-gray-300">→</span>
                <span className="text-indigo-600 truncate min-w-0 flex-1">{value}</span>
                <button onClick={() => { copyToClipboard(value, (v) => v ? setCopiedId(id) : setCopiedId(null)); }}
                  className="shrink-0 text-gray-400 hover:text-indigo-500 transition-colors">
                  {copiedId === id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store assignment */}
      {d.isVerified && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/50 flex items-center gap-3">
          <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={d.store?.id ?? ""}
            onChange={(e) => onAssign(d.id, e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700"
          >
            <option value="">— Aucun store associé —</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
