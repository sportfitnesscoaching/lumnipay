"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GitBranch } from "lucide-react";

interface PFProcessor { processor: { id: string; name: string; type: string }; priority: number; }
interface PaymentFlow { id: string; name: string; strategy: string; active: boolean; processors: PFProcessor[]; }
interface Processor { id: string; name: string; type: string; }

const STRATEGIES = ["SIMPLE", "CASCADE", "ROUND_ROBIN", "PERCENTAGE"];

export default function PaymentFlowsPage() {
  const [flows, setFlows] = useState<PaymentFlow[]>([]);
  const [processors, setProcessors] = useState<Processor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState("SIMPLE");
  const [selectedProcessorId, setSelectedProcessorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [flowsRes, procRes] = await Promise.all([
      api.get<{ paymentFlows: PaymentFlow[] }>("/payment-flows").catch(() => ({ paymentFlows: [] })),
      api.get<{ processors: Processor[] }>("/processors").catch(() => ({ processors: [] })),
    ]);
    setFlows(flowsRes.paymentFlows);
    setProcessors(procRes.processors);
    if (procRes.processors.length > 0) setSelectedProcessorId(procRes.processors[0].id);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/payment-flows", {
        name,
        strategy,
        processors: selectedProcessorId ? [{ processorId: selectedProcessorId, priority: 0 }] : [],
      });
      setShowForm(false);
      setName(""); setStrategy("SIMPLE");
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
          <h1 className="text-2xl font-bold">Payment Flows</h1>
          <p className="text-gray-500 text-sm">Routing et cascade de vos processeurs</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau flow
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Créer un payment flow</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Flow principal" required />
              </div>
              <div className="space-y-2">
                <Label>Stratégie</Label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                >
                  {STRATEGIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {processors.length > 0 && (
                <div className="space-y-2">
                  <Label>Processeur principal</Label>
                  <select
                    value={selectedProcessorId}
                    onChange={(e) => setSelectedProcessorId(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  >
                    {processors.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? "Création..." : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {flows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun payment flow</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {flows.map((f) => (
            <Card key={f.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{f.name}</p>
                  <Badge variant="secondary">{f.strategy}</Badge>
                </div>
                {f.processors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {f.processors.map((p) => (
                      <div key={p.processor.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center">
                          {p.priority + 1}
                        </span>
                        {p.processor.name} <span className="text-gray-400 text-xs">({p.processor.type})</span>
                      </div>
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
