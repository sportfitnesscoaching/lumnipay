"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck, ChevronRight } from "lucide-react";

interface SessionItem {
  variantId: string;
  quantity: number;
  price: number;
  currency: string;
  productName: string;
  variantName: string;
  imageUrl: string | null;
  recurring: boolean;
  interval: string | null;
}

interface Session {
  token: string;
  currency: string;
  subtotal: number;
  store: { name: string; logoUrl: string | null };
  items: SessionItem[];
}

type Step = "info" | "card" | "processing";

export default function CheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("info");

  // Customer info
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    fetch(`/api/v1/checkout/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSession(d.session);
        else setError(d.error ?? "Session invalide");
      })
      .catch(() => setError("Impossible de charger la session"));
  }, [token]);

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount / 100);
  }

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handlePay() {
    setStep("processing");
    setError("");
    try {
      const [expMonth, expYear] = expiry.split("/");
      const res = await fetch(`/api/v1/checkout/${token}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          card: {
            number: cardNumber.replace(/\s/g, ""),
            expMonth,
            expYear: `20${expYear}`,
            cvc,
            name: cardName,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.nextUrl);
      } else {
        setError(data.error ?? "Paiement refusé");
        setStep("card");
      }
    } catch {
      setError("Erreur réseau");
      setStep("card");
    }
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-1">Cette session est invalide ou a expiré.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {session.store.logoUrl ? (
              <Image src={session.store.logoUrl} alt={session.store.name} width={32} height={32} className="rounded" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                {session.store.name[0]}
              </div>
            )}
            <span className="font-semibold text-gray-800">{session.store.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            Paiement sécurisé
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — Form */}
        <div className="lg:col-span-3 space-y-6">

          {/* Steps indicator */}
          <div className="flex items-center gap-2 text-sm">
            <StepDot active={step === "info"} done={step === "card" || step === "processing"} label="Informations" />
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <StepDot active={step === "card" || step === "processing"} done={false} label="Paiement" />
          </div>

          {step === "info" && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Vos informations</h2>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setStep("card")}
                disabled={!email || !email.includes("@")}
              >
                Continuer vers le paiement
              </Button>
            </div>
          )}

          {(step === "card" || step === "processing") && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Informations de carte</h2>
                <div className="flex gap-1">
                  {["visa", "mc", "amex"].map((b) => (
                    <div key={b} className="w-8 h-5 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-400 font-bold">
                      {b === "visa" ? "V" : b === "mc" ? "MC" : "AX"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nom sur la carte</Label>
                <Input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label>Numéro de carte</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date d&apos;expiration</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="font-mono"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}

              <Button
                className="w-full text-base py-5"
                onClick={handlePay}
                disabled={step === "processing" || !cardNumber || !expiry || !cvc}
              >
                {step === "processing" ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Payer {formatAmount(session.subtotal, session.currency)}
                  </span>
                )}
              </Button>

              <button
                onClick={() => setStep("info")}
                className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
              >
                ← Modifier mes informations
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SSL 256-bit</span>
            <span>·</span>
            <span>Données sécurisées</span>
            <span>·</span>
            <span>Propulsé par LumniPay</span>
          </div>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              {session.items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={48}
                      height={48}
                      className="rounded-md object-cover w-12 h-12"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 text-lg shrink-0">
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.productName}</p>
                    {item.variantName && item.variantName !== "Default" && (
                      <p className="text-xs text-gray-400">{item.variantName}</p>
                    )}
                    {item.recurring && (
                      <p className="text-xs text-indigo-500">
                        {item.interval === "month" ? "Mensuel" : item.interval === "year" ? "Annuel" : item.interval}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatAmount(item.price * item.quantity, item.currency)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatAmount(session.subtotal, session.currency)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>{formatAmount(session.subtotal, session.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium ${done ? "bg-green-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}>
        {done ? "✓" : active ? "●" : "○"}
      </div>
      <span className={active || done ? "text-gray-700 font-medium" : "text-gray-400"}>{label}</span>
    </div>
  );
}
