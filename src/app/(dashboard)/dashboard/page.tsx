"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, CreditCard, Users, Package } from "lucide-react";

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
    { label: "Stores", value: stats?.stores ?? 0, icon: Store, color: "text-indigo-500" },
    { label: "Paiements", value: stats?.payments ?? 0, icon: CreditCard, color: "text-green-500" },
    { label: "Clients", value: stats?.customers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Produits", value: stats?.products ?? 0, icon: Package, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour{accountName ? `, ${accountName}` : ""} 👋
        </h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
              <Icon className={`w-5 h-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Démarrage rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <Step n={1} done={!!stats?.stores} label="Créez votre premier store" href="/dashboard/stores" />
          <Step n={2} done={false} label="Configurez un processeur de paiement" href="/dashboard/processors" />
          <Step n={3} done={false} label="Ajoutez vos produits" href="/dashboard/products" />
          <Step n={4} done={false} label="Créez votre premier funnel" href="/dashboard/funnels" />
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ n, done, label, href }: { n: number; done: boolean; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 hover:text-indigo-600 transition-colors">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
        {done ? "✓" : n}
      </div>
      <span className={done ? "line-through text-gray-400" : ""}>{label}</span>
    </a>
  );
}
