"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  processorRef: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CAPTURED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
  VOIDED: "bg-gray-100 text-gray-500",
  DISPUTED: "bg-orange-100 text-orange-700",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get<{ payments: Payment[]; pagination: { total: number } }>("/payments")
      .then((res) => { setPayments(res.payments); setTotal(res.pagination.total); })
      .catch(() => {/* silent */});
  }, []);

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount / 100);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paiements</h1>
        <p className="text-gray-500 text-sm">{total} paiements au total</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Transactions récentes</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun paiement pour l&apos;instant</p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleString("fr-FR")}
                      {p.processorRef && ` · ${p.processorRef}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100"}`}>
                      {p.status}
                    </span>
                    <span className="font-semibold text-sm">
                      {formatAmount(p.amount, p.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
