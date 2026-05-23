"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Plus, Package, Trash2, X, RefreshCw } from "lucide-react";

interface Variant {
  id: string; name: string; price: number; currency: string;
  recurring: boolean; interval: string | null; trialDays: number | null; sku: string | null;
}
interface ProductType {
  id: string; name: string; description: string | null;
  imageUrl: string | null; images: string[];
  active: boolean; variants: Variant[];
}
interface StoreType { id: string; name: string; baseCurrency: string; }
interface DraftVariant {
  name: string; price: string; currency: string;
  recurring: boolean; interval: string; trialDays: string; sku: string;
}

const INTERVALS = [
  { value: "day", label: "Jour" }, { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" }, { value: "year", label: "An" },
];

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount / 100);
  } catch { return `${amount / 100} ${currency}`; }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<DraftVariant[]>([
    { name: "Standard", price: "", currency: "EUR", recurring: false, interval: "month", trialDays: "", sku: "" },
  ]);
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
      .then((r) => setProducts(r.products)).catch(() => {});
  }, [selectedStore]);

  const selectedStoreObj = stores.find((s) => s.id === selectedStore);

  function resetForm() {
    setName(""); setDescription(""); setImages([""]); setError("");
    setVariants([{ name: "Standard", price: "", currency: selectedStoreObj?.baseCurrency ?? "EUR", recurring: false, interval: "month", trialDays: "", sku: "" }]);
  }

  function updateVariant(i: number, field: keyof DraftVariant, value: string | boolean) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function addVariant() {
    setVariants((prev) => [...prev, {
      name: `Variante ${prev.length + 1}`, price: "", currency: selectedStoreObj?.baseCurrency ?? "EUR",
      recurring: false, interval: "month", trialDays: "", sku: "",
    }]);
  }

  function removeVariant(i: number) {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateImage(i: number, value: string) {
    setImages((prev) => prev.map((img, idx) => idx === i ? value : img));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore) return;
    setLoading(true); setError("");
    try {
      const validImages = images.filter((img) => img.trim());
      const validVariants = variants.filter((v) => v.name && v.price).map((v) => ({
        name: v.name, sku: v.sku || undefined,
        price: Math.round(parseFloat(v.price) * 100),
        currency: v.currency, recurring: v.recurring,
        interval: v.recurring ? v.interval : undefined,
        trialDays: v.recurring && v.trialDays ? parseInt(v.trialDays) : undefined,
      }));
      if (validVariants.length === 0) { setError("Ajoutez au moins une variante."); setLoading(false); return; }
      await api.post("/products", { storeId: selectedStore, name, description: description || undefined, images: validImages, variants: validVariants });
      setShowForm(false); resetForm();
      const r = await api.get<{ products: ProductType[] }>(`/products?storeId=${selectedStore}`);
      setProducts(r.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Produits</h1>
          <p className="text-gray-500 text-sm">Catalogue avec variantes et images</p>
        </div>
        <button onClick={() => setShowForm(true)} disabled={!selectedStore}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>

      {stores.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {stores.map((s) => (
            <button key={s.id} onClick={() => setSelectedStore(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedStore === s.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-gray-900">Nouveau produit</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={create} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nom du produit"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="Decrivez votre produit..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Images</h3>
                  <button type="button" onClick={() => setImages((p) => [...p, ""])}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Ajouter</button>
                </div>
                {images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <input value={img} onChange={(e) => updateImage(i, e.target.value)} type="url"
                      placeholder={`URL image ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                    {images.length > 1 && (
                      <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variantes</h3>
                  <button type="button" onClick={addVariant}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Ajouter</button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Variante {i + 1}</span>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                        <input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="Standard..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                        <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="REF-001"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Prix</label>
                        <input type="number" step="0.01" min="0" value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="29.99"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Devise</label>
                        <select value={v.currency} onChange={(e) => updateVariant(i, "currency", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                          {["EUR","USD","GBP","CHF","CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateVariant(i, "recurring", !v.recurring)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${v.recurring ? "bg-indigo-600" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${v.recurring ? "translate-x-5" : ""}`} />
                      </button>
                      <span className="text-sm text-gray-700">Abonnement</span>
                      {v.recurring && <RefreshCw className="w-4 h-4 text-indigo-500" />}
                    </div>
                    {v.recurring && (
                      <div className="grid grid-cols-2 gap-3 bg-indigo-50 rounded-xl p-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Intervalle</label>
                          <select value={v.interval} onChange={(e) => updateVariant(i, "interval", e.target.value)}
                            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm bg-white">
                            {INTERVALS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Jours essai</label>
                          <input type="number" min="0" value={v.trialDays}
                            onChange={(e) => updateVariant(i, "trialDays", e.target.value)} placeholder="7"
                            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-indigo-500 disabled:opacity-50">
                  {loading ? "Creation..." : "Creer le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Creez d abord un store</p>
          <a href="/dashboard/stores" className="text-indigo-500 text-sm hover:underline mt-1 inline-block">Aller aux stores</a>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucun produit dans ce store</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                {(p.images[0] || p.imageUrl) ? (
                  <img src={p.images[0] ?? p.imageUrl!} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-200" />
                  </div>
                )}
                {p.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    +{p.images.length - 1}
                  </span>
                )}
                <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                <div className="mt-3 space-y-1.5">
                  {p.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{v.name}</span>
                        {v.sku && <span className="text-xs text-gray-400 ml-2 font-mono">{v.sku}</span>}
                        {v.recurring && <span className="ml-2 text-xs text-indigo-600 font-medium">/{v.interval ?? "mo"}</span>}
                        {v.trialDays ? <span className="ml-1 text-xs text-emerald-600">{v.trialDays}j essai</span> : null}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{formatPrice(v.price, v.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
