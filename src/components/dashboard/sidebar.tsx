"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  CreditCard,
  GitBranch,
  Settings,
  LogOut,
  Cpu,
  Users,
  Webhook,
  Key,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
  { href: "/dashboard/products", label: "Produits", icon: Package },
  { href: "/dashboard/processors", label: "Processeurs", icon: Cpu },
  { href: "/dashboard/payment-flows", label: "Payment Flows", icon: GitBranch },
  { href: "/dashboard/funnels", label: "Funnels", icon: GitBranch },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/checkout-test", label: "Test Checkout", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("lp_token");
    router.push("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold text-indigo-400">LumniPay</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
