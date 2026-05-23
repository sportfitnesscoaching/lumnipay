"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Copy, Check } from "lucide-react";

interface StoreType { id: string; name: string; baseCurrency: string; }
interface ProductVariant { id: string; name: string; price: number; currency: string; }
interface ProductType { id: string; name: string; variants: ProductVariant[]; }

export default function CheckoutTestPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<{ stores: StoreType[] }>("/stores").then((r) => {
      setStores(r.stores);
      if (r.stores.length > 0) setSelectedStore(r.stores[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    api.get<{ products: ProductType[] }>(`/products?storeId=${selectedStore}`)
      .then((r) => {
        setProducts(r.products);
        if (r.products[0]?.variants[0]) setSelectedVariant(r.products[0].variants[0].id);
      }).catch(() => {});
  }, [selectedStore]);

  async function generate() {
    if (!selectedStore || !selectedVariant) return;
    setLoading(true);
    try {
      const variant = products.flatMap((p) => p.variants).find((v) => v.id === selectedVariant);
      const store = stores.find((s) => s.id === selectedStore);
      const res = await api.post<{ session: { checkoutUrl: string } }>("/checkout", {
        storeId: selectedStore,
        currency: store?.baseCurrency ?? "USD",
        items: [{ variantId: selectedVariant, quantity: 1, price: variant?.price ?? 0 }],
        expiresInMinutes: 60,
      });
      setCheckoutUrl(res.session.checkoutUrl);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name }))
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Tester le checkout</h1>
        <p className="text-gray-500 text-sm">Génère un lien de paiement pour tester l&apos;expérience client</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Générer un lien de paiement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Produit / Variante</label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              disabled={allVariants.length === 0}
            >
              {allVariants.length === 0
                ? <option>— Aucun produit —</option>
                : allVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.productName} — {v.name} ({new Intl.NumberFormat("fr-FR", { style: "currency", currency: v.currency }).format(v.price / 100)})
                    </option>
                  ))}
            </select>
          </div>

          <Button onClick={generate} disabled={loading || !selectedVariant} className="w-full">
            {loading ? "Génération..." : "Générer le lien checkout"}
          </Button>
        </CardContent>
      </Card>

      {checkoutUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 space-y-3">
            <p className="text-sm font-medium text-green-800">Lien généré ✓</p>
            <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
              <p className="text-xs font-mono text-gray-600 flex-1 truncate">{checkoutUrl}</p>
              <button onClick={copy} className="text-gray-400 hover:text-gray-700 shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.open(checkoutUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir dans un nouvel onglet
            </Button>
            <div className="text-xs text-green-700 bg-green-100 rounded p-2">
              <strong>Carte de test :</strong> 4242 4242 4242 4242 · exp: 12/29 · cvc: 123
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
