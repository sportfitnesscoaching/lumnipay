"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Store, Package, CreditCard, GitBranch, Settings,
  LogOut, Cpu, Users, Webhook, Key, FlaskConical, Zap, Globe, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Vue d ensemble", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
  { href: "/dashboard/products", label: "Produits", icon: Package },
  { href: "/dashboard/processors", label: "Processeurs", icon: Cpu },
  { href: "/dashboard/payment-flows", label: "Payment Flows", icon: GitBranch },
  { href: "/dashboard/funnels", label: "Funnels", icon: GitBranch },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/domains", label: "Domaines", icon: Globe },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/checkout-test", label: "Test Checkout", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Parametres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem("lp_email") === "admin@lumnipay.com");
    } catch { /* SSR */ }
  }, []);

  function logout() {
    localStorage.removeItem("lp_token");
    localStorage.removeItem("lp_email");
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-white flex flex-col border-r border-white/5 shrink-0">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">LumniPay</span>
        </div>
      </div>

      {isAdmin && (
        <div className="px-3 pt-3">
          <Link href="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border",
              pathname === "/dashboard/admin"
                ? "bg-amber-500 text-white border-amber-400 shadow-sm shadow-amber-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            )}>
            <Shield className="w-4 h-4 shrink-0" />
            Administration
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
              )}>
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-gray-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-200 transition-all duration-150">
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
