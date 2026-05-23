"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";

interface Variant { id: string; name: string; price: number; currency: string; recurring: boolean; }
interface ProductType { id: string; name: string; description: string | null; active: boolean; variants: Variant[]; }
interface StoreType { id: string; name: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
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
    api.get<{ products: ProductType[] }>(`/products?storeId=${selectedStore}`)
      .then((r) => setProducts(r.products))
      .catch(() => {});
  }, [selectedStore]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore) return;
    setLoading(true); setError("");
    try {
      await api.post("/products", {
        storeId: selectedStore,
        name,
        description: description || undefined,
        variants: [{ name: "Default", price: Math.round(parseFloat(price) * 100), currency }],
      });
      setShowForm(false);
      setName(""); setDescription(""); setPrice("");
      const r = await api.get<{ products: ProductType[] }>(`/products?storeId=${selectedStore}`);
      setProducts(r.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount / 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-gray-500 text-sm">Catalogue de vos produits et variantes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedStore}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau produit
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
          <CardHeader><CardTitle>Créer un produit</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mon produit" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description optionnelle" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prix</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" required />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} placeholder="USD" />
                </div>
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
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Créez d&apos;abord un store</p>
          <a href="/dashboard/stores" className="text-indigo-500 text-sm hover:underline">Aller aux stores →</a>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun produit dans ce store</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{p.name}</p>
                  <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Actif" : "Inactif"}</Badge>
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                {p.variants.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {p.variants.map((v) => (
                      <div key={v.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{v.name}</span>
                        <span className="font-medium">{formatPrice(v.price, v.currency)}</span>
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
