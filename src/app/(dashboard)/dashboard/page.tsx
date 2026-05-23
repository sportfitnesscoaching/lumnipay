"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Store, CreditCard, Users, Package, ArrowUpRight } from "lucide-react";

interface Stats {
  stores: number;
  payments: number;
  customers: number;
  products: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [accountRes, storesRes] = await Promise.all([
          api.post<{ account: { name: string } }>("/auth/test", {}),
          api.get<{ stores: unknown[] }>("/stores"),
        ]);
        setAccountName(accountRes.account.name);
        setStats({
          stores: storesRes.stores.length,
          payments: 0,
          customers: 0,
          products: 0,
        });
      } catch {
        // token expired
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Stores",
      value: stats?.stores ?? 0,
      icon: Store,
      href: "/dashboard/stores",
      gradient: "from-indigo-500 to-violet-600",
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Paiements",
      value: stats?.payments ?? 0,
      icon: CreditCard,
      href: "/dashboard/payments",
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Clients",
      value: stats?.customers ?? 0,
      icon: Users,
      href: "/dashboard/customers",
      gradient: "from-blue-500 to-cyan-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Produits",
      value: stats?.products ?? 0,
      icon: Package,
      href: "/dashboard/products",
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bonjour{accountName ? `, ${accountName}` : ""} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, href, bg, iconColor }) => (
          <a
            key={label}
            href={href}
            className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Démarrage rapide</h2>
        <div className="space-y-3">
          <Step n={1} done={!!stats?.stores} label="Créez votre premier store" href="/dashboard/stores" />
          <Step n={2} done={false} label="Configurez un processeur de paiement" href="/dashboard/processors" />
          <Step n={3} done={false} label="Ajoutez vos produits" href="/dashboard/products" />
          <Step n={4} done={false} label="Créez votre premier funnel" href="/dashboard/funnels" />
        </div>
      </div>
    </div>
  );
}

function Step({ n, done, label, href }: { n: number; done: boolean; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors group"
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
        done
          ? "bg-emerald-100 text-emerald-600"
          : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
      }`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-sm font-medium transition-colors ${
        done ? "line-through text-gray-400" : "text-gray-700 group-hover:text-indigo-600"
      }`}>
        {label}
      </span>
    </a>
  );
}
