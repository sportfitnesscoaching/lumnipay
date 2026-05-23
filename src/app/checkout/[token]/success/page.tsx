"use client";

import { use } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { token } = use(params);
  const { orderId } = use(searchParams);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center space-y-5">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiement réussi !</h1>
          <p className="text-gray-500 mt-2">
            Merci pour votre commande. Vous allez recevoir un email de confirmation.
          </p>
        </div>
        {orderId && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
            <span className="text-gray-500">Numéro de commande : </span>
            <span className="font-mono font-medium text-gray-700">{orderId}</span>
          </div>
        )}
        <Button variant="outline" onClick={() => window.close()} className="w-full">
          Fermer
        </Button>
        <p className="text-xs text-gray-400">Propulsé par LumniPay</p>
      </div>
    </div>
  );
}
