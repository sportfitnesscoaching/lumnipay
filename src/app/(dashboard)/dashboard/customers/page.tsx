"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Customer { id: string; email: string; firstName: string | null; lastName: string | null; createdAt: string; }
interface StoreType { id: string; name: string; }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get<{ stores: StoreType[] }>("/stores").then((r) => {
      setStores(r.stores);
      if (r.stores.length > 0) setSelectedStore(r.stores[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    api.get<{ customers: Customer[]; pagination: { total: number } }>(`/customers?storeId=${selectedStore}`)
      .then((r) => { setCustomers(r.customers); setTotal(r.pagination.total); })
      .catch(() => {});
  }, [selectedStore]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-gray-500 text-sm">{total} clients au total</p>
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

      <Card>
        <CardHeader><CardTitle>Liste des clients</CardTitle></CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun client pour l&apos;instant</p>
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {c.firstName || c.lastName ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() : c.email}
                    </p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
