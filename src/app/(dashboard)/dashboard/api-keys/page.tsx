"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Plus, Copy, Check } from "lucide-react";

interface ApiKeyType {
  id: string;
  name: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<{ apiKeys: ApiKeyType[] }>("/api-keys");
      setKeys(res.apiKeys);
    } catch { /* silent */ }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api-keys", { name });
      setShowForm(false);
      setName("");
      load();
    } finally {
      setLoading(false);
    }
  }

  function copy(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-gray-500 text-sm">Clés d&apos;authentification pour votre API</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle clé
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Créer une clé</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="flex gap-3 max-w-md">
              <div className="flex-1 space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production" required />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={loading}>{loading ? "..." : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Vos clés</CardTitle></CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune clé API</p>
            </div>
          ) : (
            <div className="divide-y">
              {keys.map((k) => (
                <div key={k.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{k.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{k.key}</p>
                    {k.lastUsed && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Dernière utilisation: {new Date(k.lastUsed).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copy(k.key)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {copied === k.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
