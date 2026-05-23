"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Cpu } from "lucide-react";

interface ProcessorType {
  id: string;
  name: string;
  type: string;
  active: boolean;
  createdAt: string;
}

const PROCESSOR_TYPES = ["STRIPE", "NMI", "ADYEN", "BRAINTREE", "SANDBOX"];

const TYPE_COLORS: Record<string, string> = {
  STRIPE: "bg-purple-100 text-purple-700",
  NMI: "bg-blue-100 text-blue-700",
  ADYEN: "bg-green-100 text-green-700",
  BRAINTREE: "bg-yellow-100 text-yellow-700",
  SANDBOX: "bg-gray-100 text-gray-600",
};

export default function ProcessorsPage() {
  const [processors, setProcessors] = useState<ProcessorType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("SANDBOX");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get<{ processors: ProcessorType[] }>("/processors");
      setProcessors(res.processors);
    } catch { /* silent */ }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const options = type === "STRIPE" ? { secretKey: apiKey } :
                      type === "SANDBOX" ? { testMode: true } :
                      { apiKey };
      await api.post("/processors", { name, type, options });
      setShowForm(false);
      setName(""); setType("SANDBOX"); setApiKey("");
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
          <h1 className="text-2xl font-bold">Processeurs</h1>
          <p className="text-gray-500 text-sm">Connectez vos passerelles de paiement</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau processeur
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Ajouter un processeur</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stripe Principal" required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                >
                  {PROCESSOR_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {type !== "SANDBOX" && (
                <div className="space-y-2">
                  <Label>Clé API</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={type === "STRIPE" ? "sk_live_..." : "Clé API"}
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? "Ajout..." : "Ajouter"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {processors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun processeur configuré</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processors.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[p.type] ?? "bg-gray-100"}`}>
                    {p.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={p.active ? "default" : "secondary"}>
                    {p.active ? "Actif" : "Inactif"}
                  </Badge>
                  <span className="text-xs text-gray-400">{p.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
