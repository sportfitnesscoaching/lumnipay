"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import {
  Plus, Store, ExternalLink, Package, Users, ShoppingCart,
  Globe, Settings2, ChevronRight, X,
} from "lucide-react";

const PLATFORMS = [
  { value: "CUSTOM", label: "Store personnalise", icon: "🏪", desc: "Creez un store de zero avec notre API et checkout." },
  { value: "WOOCOMMERCE", label: "WooCommerce", icon: "🛍️", desc: "Connectez votre boutique WordPress/WooCommerce existante." },
  { value: "SHOPIFY", label: "Shopify", icon: "🟢", desc: "Integrez votre boutique Shopify via l API Partner." },
  { value: "PRESTASHOP", label: "PrestaShop", icon: "🔵", desc: "Connectez votre PrestaShop via module officiel." },
  { value: "MAGENTO", label: "Magento", icon: "🟠", desc: "Integration Magento 2 via extension dedicee." },
];

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"];

interface StoreType {
  id: string; name: string; slug: string | null; description: string | null;
  platform: string; baseCurrency: string; primaryColor: string;
  logoUrl: string | null;
  createdAt: string;
  _count?: { products: number; orders: number; customers: number };
}

const PLATFORM_LABELS: Record<string, string> = {
  CUSTOM: "Custom", WOOCOMMERCE: "WooCommerce", SHOPIFY: "Shopify",
  PRESTASHOP: "PrestaShop", MAGENTO: "Magento",
};
const PLATFORM_COLORS: Record<string, string> = {
  CUSTOM: "bg-gray-100 text-gray-600", WOOCOMMERCE: "bg-purple-100 text-purple-700",
  SHOPIFY: "bg-green-100 text-green-700", PRESTASHOP: "bg-blue-100 text-blue-700",
  MAGENTO: "bg-orange-100 text-orange-700",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumnipay.vercel.app";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<"platform" | "details">("platform");
  const [platform, setPlatform] = useState("CUSTOM");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [platformKey, setPlatformKey] = useState("");
  const [platformSecret, setPlatformSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function load() {
    try {
      const res = await api.get<{ stores: StoreType[] }>("/stores");
      setStores(res.stores);
    } catch { /* silent */ }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setPlatform("CUSTOM"); setName(""); setSlug(""); setSlugTouched(false);
    setDescription(""); setCurrency("EUR"); setPrimaryColor("#6366f1");
    setLogoUrl(""); setCoverImageUrl(""); setPlatformUrl("");
    setPlatformKey(""); setPlatformSecret(""); setError(""); setStep("platform");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/stores", {
        name, slug: slug || undefined, description: description || undefined,
        platform, baseCurrency: currency, primaryColor,
        logoUrl: logoUrl || undefined, coverImageUrl: coverImageUrl || undefined,
        platformUrl: platformUrl || undefined, platformKey: platformKey || undefined,
        platformSecret: platformSecret || undefined,
      });
      setShowForm(false); resetForm(); load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  const platformInfo = PLATFORMS.find((p) => p.value === platform);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stores</h1>
          <p className="text-gray-500 text-sm">Gerez vos boutiques de paiement</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setStep("platform"); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Nouveau store
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouveau store</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {step === "platform" ? "Choisissez votre plateforme" : `Configuration ${platformInfo?.label}`}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {step === "platform" ? (
              <div className="p-6 space-y-3">
                {PLATFORMS.map((p) => (
                  <button key={p.value} onClick={() => { setPlatform(p.value); setStep("details"); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 ${platform === p.value ? "border-indigo-500 bg-indigo-50" : "border-gray-100"}`}>
                    <span className="text-3xl">{p.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{p.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{p.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={create} className="p-6 space-y-5">
                {platform !== "CUSTOM" && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm">
                    <p className="font-semibold text-indigo-900 mb-2">{platformInfo?.icon} Integration {platformInfo?.label}</p>
                    {platform === "WOOCOMMERCE" && (
                      <ol className="text-indigo-700 space-y-1 list-decimal list-inside">
                        <li>Installez le plugin LumniPay for WooCommerce sur votre site</li>
                        <li>Dans WooCommerce Reglages Paiements, activez LumniPay</li>
                        <li>Copiez votre URL de store et la cle API ci-dessous dans le plugin</li>
                      </ol>
                    )}
                    {platform === "SHOPIFY" && (
                      <ol className="text-indigo-700 space-y-1 list-decimal list-inside">
                        <li>Depuis votre admin Shopify, installez l app LumniPay</li>
                        <li>Renseignez votre URL myshopify.com et votre cle API Partner</li>
                        <li>LumniPay synchronisera automatiquement vos produits</li>
                      </ol>
                    )}
                    {(platform === "PRESTASHOP" || platform === "MAGENTO") && (
                      <ol className="text-indigo-700 space-y-1 list-decimal list-inside">
                        <li>Telechargez le module LumniPay pour {platformInfo?.label}</li>
                        <li>Installez-le et configurez l URL de votre boutique</li>
                        <li>Collez votre cle API dans les parametres du module</li>
                      </ol>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du store *</label>
                    <input value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Ma boutique"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Slug URL
                      <span className="ml-2 text-gray-400 font-normal text-xs">{APP_URL}/store/<strong>{slug || "mon-store"}</strong></span>
                    </label>
                    <input value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                      placeholder="mon-store"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                      placeholder="Description affichee sur votre page store publique..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Devise</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Couleur principale</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} maxLength={7}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL du logo</label>
                    <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." type="url"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image de couverture</label>
                    <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." type="url"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>

                  {platform !== "CUSTOM" && (
                    <>
                      <div className="col-span-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Connexion {platformInfo?.label}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">URL boutique</label>
                        <input value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)}
                          placeholder={platform === "SHOPIFY" ? "ma-boutique.myshopify.com" : "https://ma-boutique.com"}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {platform === "SHOPIFY" ? "API Key" : "Consumer Key"}
                        </label>
                        <input value={platformKey} onChange={(e) => setPlatformKey(e.target.value)} type="password"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {platform === "SHOPIFY" ? "API Secret" : "Consumer Secret"}
                        </label>
                        <input value={platformSecret} onChange={(e) => setPlatformSecret(e.target.value)} type="password"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </>
                  )}
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("platform")}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    Retour
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    {loading ? "Creation..." : "Creer le store"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucun store pour l instant</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="h-2" style={{ backgroundColor: s.primaryColor || "#6366f1" }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: s.primaryColor || "#6366f1" }}>
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{s.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${PLATFORM_COLORS[s.platform] ?? "bg-gray-100 text-gray-600"}`}>
                        {PLATFORM_LABELS[s.platform] ?? s.platform}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.slug && (
                      <a href={`${APP_URL}/store/${s.slug}`} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Package, label: "Produits", value: s._count?.products ?? 0 },
                    { icon: ShoppingCart, label: "Commandes", value: s._count?.orders ?? 0 },
                    { icon: Users, label: "Clients", value: s._count?.customers ?? 0 },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-gray-900">{value}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
                {s.slug && (
                  <div className="mt-3 flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2">
                    <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs text-indigo-600 truncate font-mono">{APP_URL.replace("https://","")}/store/{s.slug}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
