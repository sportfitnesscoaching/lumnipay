"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Account { id: string; name: string; email: string; plan: string; createdAt: string; }

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    api.post<{ account: Account }>("/auth/test", {})
      .then((r) => setAccount(r.account))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-500 text-sm">Informations de votre compte</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Votre compte</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {account ? (
            <>
              <Row label="Nom" value={account.name} />
              <Row label="Email" value={account.email} />
              <Row label="ID" value={account.id} mono />
              <Row label="Plan" value={<Badge>{account.plan}</Badge>} />
              <Row label="Membre depuis" value={new Date(account.createdAt).toLocaleDateString("fr-FR")} />
            </>
          ) : (
            <p className="text-gray-400 text-sm">Chargement...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono text-gray-600" : ""}`}>{value}</span>
    </div>
  );
}
