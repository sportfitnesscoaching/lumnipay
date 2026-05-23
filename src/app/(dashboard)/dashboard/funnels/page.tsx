"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GitBranch } from "lucide-react";

interface FunnelStep { id: string; order: number; type: string; }
interface FunnelType { id: string; name: string; slug: string; active: boolean; steps: FunnelStep[]; }
interface StoreType { id: string; name: string; }

const STEP_TYPES = ["CHECKOUT", "UPSELL", "DOWNSELL", "THANK_YOU"];

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<FunnelType[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ stores: StoreType[] }>("/stores").then((r) => {
      setStores(r.stores);
      if (r.stores.length > 0) setSelectedStore(r.stores[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    api.get<{ funnels: FunnelType[] }>(`/funnels?storeId=${selectedStore}`)
      .then((r) => setFunnels(r.funnels))
      .catch(() => {});
  }, [selectedStore]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore) return;
    setLoading(true); setError("");
    try {
      await api.post("/funnels", {
        storeId: selectedStore,
        name,
        slug,
        steps: [
          { order: 1, type: "CHECKOUT", config: {} },
          { order: 2, type: "THANK_YOU", config: {} },
        ],
      });
      setShowForm(false);
      setName(""); setSlug("");
      const r = await api.get<{ funnels: FunnelType[] }>(`/funnels?storeId=${selectedStore}`);
      setFunnels(r.funnels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funnels</h1>
          <p className="text-gray-500 text-sm">Séquences de paiement et upsells</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedStore}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau funnel
        </Button>
      </div>

      {stores.length > 1 && (
        <div className="flex gap-2">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStore(s.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedStore === s.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Créer un funnel</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mon funnel principal" required />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="mon-funnel"
                  required
                />
              </div>
              <p className="text-xs text-gray-400">
                Un funnel de base est créé avec 2 étapes : Checkout → Thank You
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? "Création..." : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {stores.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Créez d&apos;abord un store</p>
          <a href="/dashboard/stores" className="text-indigo-500 text-sm hover:underline">Aller aux stores →</a>
        </div>
      ) : funnels.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun funnel dans ce store</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {funnels.map((f) => (
            <Card key={f.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-sm text-gray-400 font-mono mt-0.5">/{f.slug}</p>
                  </div>
                  <Badge variant={f.active ? "default" : "secondary"}>
                    {f.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                {f.steps.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {f.steps.map((s, i) => (
                      <span key={s.id} className="flex items-center gap-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {s.type}
                        </span>
                        {i < f.steps.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
