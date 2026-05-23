"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Shield, Users, Store, Key, Crown } from "lucide-react";

interface AccountRow {
  id: string; name: string; email: string; plan: string;
  storeCount: number; apiKeyCount: number; createdAt: string;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  STARTER: "bg-blue-100 text-blue-700",
  PRO: "bg-indigo-100 text-indigo-700",
  ENTERPRISE: "bg-amber-100 text-amber-700",
};

export default function AdminPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ accounts: AccountRow[] }>("/admin/accounts")
      .then((r) => setAccounts(r.accounts))
      .catch((e) => setError(e.message ?? "Accès refusé"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Administration</h1>
          <p className="text-gray-500 text-sm">Vue globale de tous les comptes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Comptes total", value: accounts.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Stores total", value: accounts.reduce((s, a) => s + a.storeCount, 0), icon: Store, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "API Keys total", value: accounts.reduce((s, a) => s + a.apiKeyCount, 0), icon: Key, color: "text-orange-500", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tous les comptes</h2>
          <span className="text-sm text-gray-400">{accounts.length} comptes</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Compte</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Plan</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Stores</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">API Keys</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600">
                            {a.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-1.5">
                            {a.name}
                            {a.email === "admin@lumnipay.com" && (
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </div>
                          <div className="text-gray-500 text-xs">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[a.plan] ?? "bg-gray-100 text-gray-600"}`}>
                        {a.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-gray-900">{a.storeCount}</td>
                    <td className="px-4 py-4 text-center font-medium text-gray-900">{a.apiKeyCount}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
