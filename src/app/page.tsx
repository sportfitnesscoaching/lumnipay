"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, ArrowRight, CreditCard, GitBranch, Store, Webhook,
  Shield, BarChart3, CheckCircle2, Globe, Package, Cpu,
} from "lucide-react";
import {
  t, langs,
  type Lang, type NavTx, type HeroTx, type FeaturesTx,
  type HowTx, type CtaTx, type FooterTx, type Translations,
} from "@/lib/homepage-i18n";

const featureIcons = [Cpu, GitBranch, Store, CreditCard, Webhook, Shield];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("fr");
  const tx = t[lang];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar tx={tx.nav} lang={lang} setLang={setLang} />
      <Hero tx={tx.hero} txCta={tx.cta} />
      <LogoBar label={tx.logos.label} />
      <Features tx={tx.features} />
      <HowItWorks tx={tx.how} />
      <Stats stats={tx.stats} />
      <CtaSection tx={tx.cta} />
      <Footer tx={tx.footer} />
    </div>
  );
}

/* ─── Lang switcher ──────────────────────────────────────────────────── */

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
      {langs.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            lang === code
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────── */

function Navbar({
  tx, lang, setLang,
}: {
  tx: NavTx;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">LumniPay</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">{tx.features}</a>
          <a href="#how" className="hover:text-white transition-colors">{tx.how}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{tx.pricing}</a>
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher lang={lang} setLang={setLang} />
          <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            {tx.login}
          </Link>
          <Link
            href="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            {tx.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

function Hero({ tx, txCta }: { tx: HeroTx; txCta: CtaTx }) {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          {tx.badge}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          {tx.h1a}
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            {tx.h1b}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {tx.sub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            {tx.ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-7 py-3.5 rounded-xl transition-all"
          >
            {tx.ctaSecondary}
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10 rounded-2xl pointer-events-none" />
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-gray-900/80">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 max-w-xs mx-auto text-center">
                  {tx.browserBar}
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="w-48 bg-gray-950 p-4 space-y-1 hidden sm:block">
                {["Overview", "Stores", "Products", "Processors", "Funnels", "Payments", "Customers"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                      i === 0 ? "bg-indigo-600 text-white" : "text-gray-500"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-white/30" : "bg-white/10"}`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-6 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Stores", val: "3", color: "bg-indigo-500/20 text-indigo-400" },
                    { label: "Payments", val: "1 247", color: "bg-emerald-500/20 text-emerald-400" },
                    { label: "Customers", val: "892", color: "bg-blue-500/20 text-blue-400" },
                    { label: "Products", val: "24", color: "bg-orange-500/20 text-orange-400" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-4">
                      <div className={`text-xs font-medium mb-1 ${color}`}>{label}</div>
                      <div className="text-xl font-bold text-white">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-3">Revenue — last 30 days</div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 50, 72].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{ height: `${h}%`, background: `oklch(0.55 0.22 264 / ${i === 13 ? 1 : 0.4})` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Logo bar ───────────────────────────────────────────────────────── */

function LogoBar({ label }: { label: string }) {
  const integrations = ["Stripe", "PayPal", "Mollie", "Adyen", "Braintree", "Checkout.com"];
  return (
    <section className="py-12 border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm text-gray-600 mb-8 uppercase tracking-widest font-medium">{label}</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {integrations.map((name) => (
            <span key={name} className="text-gray-600 font-semibold text-sm hover:text-gray-400 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────── */

const featureStyles = [
  { color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { color: "text-violet-400", bg: "bg-violet-500/10" },
  { color: "text-blue-400", bg: "bg-blue-500/10" },
  { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { color: "text-orange-400", bg: "bg-orange-500/10" },
  { color: "text-pink-400", bg: "bg-pink-500/10" },
];

function Features({ tx }: { tx: FeaturesTx }) {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-5">
            <BarChart3 className="w-3.5 h-3.5" />
            {tx.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {tx.h2a} <br />
            <span className="text-gray-500">{tx.h2b}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{tx.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tx.items.map(({ title, desc }, i) => {
            const Icon = featureIcons[i];
            const { color, bg } = featureStyles[i];
            return (
              <div
                key={title}
                className="group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────────────── */

const stepIcons = [Store, Package, Globe];

function HowItWorks({ tx }: { tx: HowTx }) {
  return (
    <section id="how" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {tx.h2a} <span className="text-indigo-400">{tx.h2b}</span>
          </h2>
          <p className="text-gray-400 text-lg">{tx.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tx.steps.map(({ n, title, desc }, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={n} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-xs font-bold text-indigo-500/60 tracking-widest mb-2">{n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────────── */

function Stats({ stats }: { stats: Translations["stats"] }) {
  return (
    <section className="py-16 px-6 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA section ────────────────────────────────────────────────────── */

function CtaSection({ tx }: { tx: CtaTx }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-12 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">{tx.h2}</h2>
            <p className="text-indigo-200 mb-8 text-lg">{tx.sub}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-xl"
              >
                {tx.primary}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="flex items-center gap-2 text-indigo-200 hover:text-white font-medium transition-colors">
                {tx.secondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-200">
              {tx.perks.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function Footer({ tx }: { tx: FooterTx }) {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-white">LumniPay</span>
        </div>
        <p className="text-sm text-gray-600">{tx.copy}</p>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-400 transition-colors">{tx.privacy}</a>
          <a href="#" className="hover:text-gray-400 transition-colors">{tx.terms}</a>
          <a href="#" className="hover:text-gray-400 transition-colors">{tx.contact}</a>
        </div>
      </div>
    </footer>
  );
}
