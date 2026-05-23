"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Webhook } from "lucide-react";

interface WebhookType { id: string; url: string; events: string[]; active: boolean; }

const AVAILABLE_EVENTS = [
  "payment.captured", "payment.failed", "payment.refunded",
  "order.created", "order.paid", "subscription.created", "subscription.cancelled",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["payment.captured"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    api.get<{ webhooks: WebhookType[] }>("/webhooks").then((r) => setWebhooks(r.webhooks)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/webhooks", { url, events });
      setShowForm(false);
      setUrl(""); setEvents(["payment.captured"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function toggleEvent(evt: string) {
    setEvents((prev) => prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-gray-500 text-sm">Notifications d&apos;événements vers vos serveurs</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau webhook
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Créer un webhook</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://monsite.com/webhooks/lumnipay" required />
              </div>
              <div className="space-y-2">
                <Label>Événements</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map((evt) => (
                    <button
                      key={evt}
                      type="button"
                      onClick={() => toggleEvent(evt)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${events.includes(evt) ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-400"}`}
                    >
                      {evt}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || events.length === 0}>{loading ? "Création..." : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {webhooks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun webhook configuré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <Card key={w.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{w.url}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {w.events.map((evt) => (
                        <span key={evt} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{evt}</span>
                      ))}
                    </div>
                  </div>
                  <Badge variant={w.active ? "default" : "secondary"}>{w.active ? "Actif" : "Inactif"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
