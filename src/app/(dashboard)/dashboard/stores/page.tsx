"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Store } from "lucide-react";

interface StoreType {
  id: string;
  name: string;
  baseCurrency: string;
  domain: string | null;
  createdAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get<{ stores: StoreType[] }>("/stores");
      setStores(res.stores);
    } catch { /* silent */ }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/stores", { name, baseCurrency: currency, domain: domain || undefined });
      setShowForm(false);
      setName(""); setCurrency("USD"); setDomain("");
      load();
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
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-gray-500 text-sm">Gérez vos boutiques de paiement</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau store
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Créer un store</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ma boutique" required />
              </div>
              <div className="space-y-2">
                <Label>Devise de base</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" maxLength={3} />
              </div>
              <div className="space-y-2">
                <Label>Domaine (optionnel)</Label>
                <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="checkout.monsite.com" />
              </div>
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
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun store pour l&apos;instant</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.id}</p>
                  </div>
                  <Badge variant="secondary">{s.baseCurrency}</Badge>
                </div>
                {s.domain && <p className="text-xs text-indigo-500 mt-2">{s.domain}</p>}
                <p className="text-xs text-gray-400 mt-3">
                  Créé le {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
