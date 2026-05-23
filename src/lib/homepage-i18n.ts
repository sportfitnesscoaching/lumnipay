export type Lang = "fr" | "en" | "de" | "it";

export const langs: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "it", label: "IT", flag: "🇮🇹" },
];

export interface NavTx { features: string; how: string; pricing: string; login: string; cta: string }
export interface HeroTx { badge: string; h1a: string; h1b: string; sub: string; ctaPrimary: string; ctaSecondary: string; browserBar: string }
export interface FeaturesTx { badge: string; h2a: string; h2b: string; sub: string; items: { title: string; desc: string }[] }
export interface HowTx { h2a: string; h2b: string; sub: string; steps: { n: string; title: string; desc: string }[] }
export type StatsTx = { value: string; label: string }[]
export interface CtaTx { h2: string; sub: string; primary: string; secondary: string; perks: string[] }
export interface FooterTx { copy: string; privacy: string; terms: string; contact: string }

export interface PricingPlan {
  name: string;
  badge?: string;
  monthlyPrice: string;
  annualPrice: string;
  annualNote: string;
  desc: string;
  cta: string;
  popular: boolean;
  features: string[];
}
export interface PricingTx {
  badge: string;
  h2a: string;
  h2b: string;
  sub: string;
  toggleMonthly: string;
  toggleAnnual: string;
  saveLabel: string;
  plans: [PricingPlan, PricingPlan, PricingPlan];
}

export interface Translations {
  nav: NavTx;
  hero: HeroTx;
  logos: { label: string };
  features: FeaturesTx;
  how: HowTx;
  stats: { value: string; label: string }[];
  pricing: PricingTx;
  cta: CtaTx;
  footer: FooterTx;
}

export const t: Record<Lang, Translations> = {
  fr: {
    nav: {
      features: "Fonctionnalités",
      how: "Comment ça marche",
      pricing: "Tarifs",
      login: "Connexion",
      cta: "Commencer gratuitement",
    },
    hero: {
      badge: "Plateforme de paiement nouvelle génération",
      h1a: "Encaissez plus,",
      h1b: "gérez moins.",
      sub: "LumniPay centralise vos paiements, funnels et stores en une seule plateforme. Routage multi-processeurs intelligent, checkout optimisé et webhooks en temps réel.",
      ctaPrimary: "Démarrer gratuitement",
      ctaSecondary: "Voir la démo",
      browserBar: "app.lumnipay.com/dashboard",
    },
    logos: {
      label: "Compatible avec vos processeurs préférés",
    },
    features: {
      badge: "Tout ce dont vous avez besoin",
      h2a: "Une plateforme,",
      h2b: "toutes les possibilités.",
      sub: "De la gestion des produits jusqu'à l'encaissement, LumniPay couvre l'intégralité de votre flux de paiement.",
      items: [
        {
          title: "Routage multi-processeurs",
          desc: "Configurez des règles intelligentes pour router chaque paiement vers le processeur optimal selon la devise, le pays ou le montant.",
        },
        {
          title: "Funnels & upsells",
          desc: "Créez des parcours d'achat complets avec des étapes d'upsell, order bumps et one-click upsells post-paiement.",
        },
        {
          title: "Gestion multi-stores",
          desc: "Gérez plusieurs boutiques depuis un seul tableau de bord. Chaque store a ses propres produits, processeurs et analytics.",
        },
        {
          title: "Checkout optimisé",
          desc: "Pages de checkout rapides et mobile-first avec remplissage automatique, sauvegarde des cartes et taux de conversion maximisé.",
        },
        {
          title: "Webhooks & API",
          desc: "API REST complète et webhooks en temps réel pour synchroniser vos outils CRM, email et analytics instantanément.",
        },
        {
          title: "Sécurité & conformité",
          desc: "Authentification JWT, clés API scoped et audit trail complet pour rester conforme et sécurisé à tout moment.",
        },
      ],
    },
    how: {
      h2a: "Opérationnel en",
      h2b: "10 minutes",
      sub: "Pas de configuration complexe, pas de développeurs nécessaires.",
      steps: [
        { n: "01", title: "Créez votre store", desc: "Configurez votre boutique en quelques minutes. Ajoutez vos produits, variantes et prix." },
        { n: "02", title: "Connectez vos processeurs", desc: "Branchez Stripe, PayPal ou tout autre processeur et définissez vos règles de routage." },
        { n: "03", title: "Lancez et encaissez", desc: "Partagez votre lien checkout ou intégrez via API. Recevez des paiements dans le monde entier." },
      ],
    },
    stats: [
      { value: "99.9%", label: "Disponibilité garantie" },
      { value: "< 200ms", label: "Temps de réponse API" },
      { value: "150+", label: "Devises supportées" },
      { value: "0€", label: "Pour démarrer" },
    ],
    pricing: {
      badge: "Tarifs simples et transparents",
      h2a: "Le bon plan",
      h2b: "pour votre activité.",
      sub: "Commencez gratuitement, évoluez à votre rythme. Aucune surprise, aucun engagement.",
      toggleMonthly: "Mensuel",
      toggleAnnual: "Annuel",
      saveLabel: "Économisez 20%",
      plans: [
        {
          name: "Starter",
          monthlyPrice: "0€",
          annualPrice: "0€",
          annualNote: "Gratuit pour toujours",
          desc: "Idéal pour tester et lancer votre premier store.",
          cta: "Commencer gratuitement",
          popular: false,
          features: [
            "1 store",
            "5 produits",
            "1 processeur de paiement",
            "Checkout standard",
            "Support par email",
          ],
        },
        {
          name: "Pro",
          badge: "Populaire",
          monthlyPrice: "49€",
          annualPrice: "39€",
          annualNote: "/mois, facturé annuellement",
          desc: "Pour les marchands en croissance qui veulent plus.",
          cta: "Démarrer en Pro",
          popular: true,
          features: [
            "5 stores",
            "Produits illimités",
            "Routage multi-processeurs",
            "Checkout personnalisé",
            "Funnels & upsells",
            "Webhooks & API",
            "Support prioritaire",
          ],
        },
        {
          name: "Scale",
          monthlyPrice: "149€",
          annualPrice: "119€",
          annualNote: "/mois, facturé annuellement",
          desc: "Pour les équipes et volumes importants.",
          cta: "Contacter l'équipe",
          popular: false,
          features: [
            "Stores illimités",
            "Produits illimités",
            "Règles de routage avancées",
            "Checkout white-label",
            "Analytics avancés",
            "Intégrations personnalisées",
            "Account manager dédié",
          ],
        },
      ],
    },
    cta: {
      h2: "Prêt à encaisser vos premiers paiements ?",
      sub: "Rejoignez des centaines de marchands qui font confiance à LumniPay.",
      primary: "Créer mon compte gratuit",
      secondary: "Déjà un compte ? Connexion",
      perks: ["Aucune carte requise", "Setup en 10 min", "Support inclus"],
    },
    footer: {
      copy: "© 2026 LumniPay. Tous droits réservés.",
      privacy: "Confidentialité",
      terms: "CGU",
      contact: "Contact",
    },
  },

  en: {
    nav: {
      features: "Features",
      how: "How it works",
      pricing: "Pricing",
      login: "Sign in",
      cta: "Get started free",
    },
    hero: {
      badge: "Next-generation payment platform",
      h1a: "Collect more,",
      h1b: "manage less.",
      sub: "LumniPay centralises your payments, funnels and stores in one platform. Intelligent multi-processor routing, optimised checkout and real-time webhooks.",
      ctaPrimary: "Start for free",
      ctaSecondary: "See a demo",
      browserBar: "app.lumnipay.com/dashboard",
    },
    logos: {
      label: "Compatible with your favourite processors",
    },
    features: {
      badge: "Everything you need",
      h2a: "One platform,",
      h2b: "endless possibilities.",
      sub: "From product management to payment collection, LumniPay covers your entire payment flow.",
      items: [
        {
          title: "Multi-processor routing",
          desc: "Set up smart rules to route each payment to the optimal processor based on currency, country or amount.",
        },
        {
          title: "Funnels & upsells",
          desc: "Build complete purchase journeys with upsell steps, order bumps and one-click post-purchase upsells.",
        },
        {
          title: "Multi-store management",
          desc: "Manage multiple shops from a single dashboard. Each store has its own products, processors and analytics.",
        },
        {
          title: "Optimised checkout",
          desc: "Fast, mobile-first checkout pages with autofill, saved cards and maximised conversion rates.",
        },
        {
          title: "Webhooks & API",
          desc: "Full REST API and real-time webhooks to sync your CRM, email and analytics tools instantly.",
        },
        {
          title: "Security & compliance",
          desc: "JWT authentication, scoped API keys and a complete audit trail to stay compliant and secure at all times.",
        },
      ],
    },
    how: {
      h2a: "Up and running in",
      h2b: "10 minutes",
      sub: "No complex setup, no developers required.",
      steps: [
        { n: "01", title: "Create your store", desc: "Set up your shop in minutes. Add your products, variants and prices." },
        { n: "02", title: "Connect your processors", desc: "Plug in Stripe, PayPal or any other processor and define your routing rules." },
        { n: "03", title: "Launch and collect", desc: "Share your checkout link or integrate via API. Receive payments worldwide." },
      ],
    },
    stats: [
      { value: "99.9%", label: "Guaranteed uptime" },
      { value: "< 200ms", label: "API response time" },
      { value: "150+", label: "Supported currencies" },
      { value: "€0", label: "To get started" },
    ],
    pricing: {
      badge: "Simple, transparent pricing",
      h2a: "The right plan",
      h2b: "for your business.",
      sub: "Start for free, scale at your own pace. No surprises, no commitment.",
      toggleMonthly: "Monthly",
      toggleAnnual: "Annual",
      saveLabel: "Save 20%",
      plans: [
        {
          name: "Starter",
          monthlyPrice: "€0",
          annualPrice: "€0",
          annualNote: "Free forever",
          desc: "Perfect for testing and launching your first store.",
          cta: "Get started free",
          popular: false,
          features: [
            "1 store",
            "5 products",
            "1 payment processor",
            "Standard checkout",
            "Email support",
          ],
        },
        {
          name: "Pro",
          badge: "Popular",
          monthlyPrice: "€49",
          annualPrice: "€39",
          annualNote: "/mo, billed annually",
          desc: "For growing merchants who need more power.",
          cta: "Start with Pro",
          popular: true,
          features: [
            "5 stores",
            "Unlimited products",
            "Multi-processor routing",
            "Custom checkout branding",
            "Funnels & upsells",
            "Webhooks & API",
            "Priority support",
          ],
        },
        {
          name: "Scale",
          monthlyPrice: "€149",
          annualPrice: "€119",
          annualNote: "/mo, billed annually",
          desc: "For teams and high-volume merchants.",
          cta: "Contact sales",
          popular: false,
          features: [
            "Unlimited stores",
            "Unlimited products",
            "Advanced routing rules",
            "White-label checkout",
            "Advanced analytics",
            "Custom integrations",
            "Dedicated account manager",
          ],
        },
      ],
    },
    cta: {
      h2: "Ready to collect your first payments?",
      sub: "Join hundreds of merchants who trust LumniPay.",
      primary: "Create my free account",
      secondary: "Already have an account? Sign in",
      perks: ["No credit card required", "10-min setup", "Support included"],
    },
    footer: {
      copy: "© 2026 LumniPay. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    },
  },

  de: {
    nav: {
      features: "Funktionen",
      how: "So funktioniert's",
      pricing: "Preise",
      login: "Anmelden",
      cta: "Kostenlos starten",
    },
    hero: {
      badge: "Zahlungsplattform der nächsten Generation",
      h1a: "Mehr einnehmen,",
      h1b: "weniger verwalten.",
      sub: "LumniPay zentralisiert Ihre Zahlungen, Funnels und Stores auf einer Plattform. Intelligentes Multi-Prozessor-Routing, optimierter Checkout und Echtzeit-Webhooks.",
      ctaPrimary: "Kostenlos starten",
      ctaSecondary: "Demo ansehen",
      browserBar: "app.lumnipay.com/dashboard",
    },
    logos: {
      label: "Kompatibel mit Ihren bevorzugten Zahlungsanbietern",
    },
    features: {
      badge: "Alles, was Sie brauchen",
      h2a: "Eine Plattform,",
      h2b: "alle Möglichkeiten.",
      sub: "Von der Produktverwaltung bis zur Zahlungsabwicklung – LumniPay deckt Ihren gesamten Zahlungsfluss ab.",
      items: [
        {
          title: "Multi-Prozessor-Routing",
          desc: "Richten Sie intelligente Regeln ein, um jede Zahlung je nach Währung, Land oder Betrag an den optimalen Prozessor weiterzuleiten.",
        },
        {
          title: "Funnels & Upsells",
          desc: "Erstellen Sie vollständige Kaufprozesse mit Upsell-Schritten, Order Bumps und One-Click-Upsells nach dem Kauf.",
        },
        {
          title: "Multi-Store-Verwaltung",
          desc: "Verwalten Sie mehrere Shops über ein einziges Dashboard. Jeder Store hat seine eigenen Produkte, Prozessoren und Analysen.",
        },
        {
          title: "Optimierter Checkout",
          desc: "Schnelle, mobiloptimierte Checkout-Seiten mit Autofill, gespeicherten Karten und maximierten Konversionsraten.",
        },
        {
          title: "Webhooks & API",
          desc: "Vollständige REST-API und Echtzeit-Webhooks zur sofortigen Synchronisierung Ihrer CRM-, E-Mail- und Analyse-Tools.",
        },
        {
          title: "Sicherheit & Compliance",
          desc: "JWT-Authentifizierung, bereichsbezogene API-Schlüssel und ein vollständiges Audit-Trail für dauerhaft sichere Compliance.",
        },
      ],
    },
    how: {
      h2a: "Einsatzbereit in",
      h2b: "10 Minuten",
      sub: "Keine komplexe Einrichtung, keine Entwickler erforderlich.",
      steps: [
        { n: "01", title: "Store erstellen", desc: "Richten Sie Ihren Shop in wenigen Minuten ein. Fügen Sie Produkte, Varianten und Preise hinzu." },
        { n: "02", title: "Prozessoren verbinden", desc: "Verbinden Sie Stripe, PayPal oder einen anderen Anbieter und legen Sie Ihre Routing-Regeln fest." },
        { n: "03", title: "Starten und kassieren", desc: "Teilen Sie Ihren Checkout-Link oder integrieren Sie per API. Empfangen Sie Zahlungen weltweit." },
      ],
    },
    stats: [
      { value: "99,9%", label: "Garantierte Verfügbarkeit" },
      { value: "< 200ms", label: "API-Antwortzeit" },
      { value: "150+", label: "Unterstützte Währungen" },
      { value: "0€", label: "Zum Starten" },
    ],
    pricing: {
      badge: "Einfache, transparente Preise",
      h2a: "Der richtige Plan",
      h2b: "für Ihr Business.",
      sub: "Kostenlos starten, in Ihrem Tempo wachsen. Keine Überraschungen, keine Bindung.",
      toggleMonthly: "Monatlich",
      toggleAnnual: "Jährlich",
      saveLabel: "20% sparen",
      plans: [
        {
          name: "Starter",
          monthlyPrice: "0€",
          annualPrice: "0€",
          annualNote: "Für immer kostenlos",
          desc: "Ideal zum Testen und für Ihren ersten Store.",
          cta: "Kostenlos starten",
          popular: false,
          features: [
            "1 Store",
            "5 Produkte",
            "1 Zahlungsanbieter",
            "Standard-Checkout",
            "E-Mail-Support",
          ],
        },
        {
          name: "Pro",
          badge: "Beliebt",
          monthlyPrice: "49€",
          annualPrice: "39€",
          annualNote: "/Monat, jährlich abgerechnet",
          desc: "Für wachsende Händler mit höheren Ansprüchen.",
          cta: "Mit Pro starten",
          popular: true,
          features: [
            "5 Stores",
            "Unbegrenzte Produkte",
            "Multi-Prozessor-Routing",
            "Individuelles Checkout-Design",
            "Funnels & Upsells",
            "Webhooks & API",
            "Prioritäts-Support",
          ],
        },
        {
          name: "Scale",
          monthlyPrice: "149€",
          annualPrice: "119€",
          annualNote: "/Monat, jährlich abgerechnet",
          desc: "Für Teams und hohe Transaktionsvolumen.",
          cta: "Vertrieb kontaktieren",
          popular: false,
          features: [
            "Unbegrenzte Stores",
            "Unbegrenzte Produkte",
            "Erweiterte Routing-Regeln",
            "White-Label-Checkout",
            "Erweiterte Analysen",
            "Individuelle Integrationen",
            "Dedizierter Account-Manager",
          ],
        },
      ],
    },
    cta: {
      h2: "Bereit, Ihre ersten Zahlungen zu empfangen?",
      sub: "Schließen Sie sich hunderten von Händlern an, die LumniPay vertrauen.",
      primary: "Kostenloses Konto erstellen",
      secondary: "Bereits Kunde? Anmelden",
      perks: ["Keine Kreditkarte erforderlich", "10-Min-Setup", "Support inklusive"],
    },
    footer: {
      copy: "© 2026 LumniPay. Alle Rechte vorbehalten.",
      privacy: "Datenschutz",
      terms: "AGB",
      contact: "Kontakt",
    },
  },

  it: {
    nav: {
      features: "Funzionalità",
      how: "Come funziona",
      pricing: "Prezzi",
      login: "Accedi",
      cta: "Inizia gratuitamente",
    },
    hero: {
      badge: "Piattaforma di pagamento di nuova generazione",
      h1a: "Incassa di più,",
      h1b: "gestisci di meno.",
      sub: "LumniPay centralizza i tuoi pagamenti, funnel e store in un'unica piattaforma. Routing multi-processore intelligente, checkout ottimizzato e webhook in tempo reale.",
      ctaPrimary: "Inizia gratuitamente",
      ctaSecondary: "Guarda la demo",
      browserBar: "app.lumnipay.com/dashboard",
    },
    logos: {
      label: "Compatibile con i tuoi processori preferiti",
    },
    features: {
      badge: "Tutto ciò di cui hai bisogno",
      h2a: "Una piattaforma,",
      h2b: "infinite possibilità.",
      sub: "Dalla gestione dei prodotti all'incasso, LumniPay copre l'intero flusso di pagamento.",
      items: [
        {
          title: "Routing multi-processore",
          desc: "Configura regole intelligenti per instradare ogni pagamento al processore ottimale in base a valuta, paese o importo.",
        },
        {
          title: "Funnel & upsell",
          desc: "Crea percorsi d'acquisto completi con step di upsell, order bump e upsell one-click post-pagamento.",
        },
        {
          title: "Gestione multi-store",
          desc: "Gestisci più negozi da un unico pannello. Ogni store ha i propri prodotti, processori e analytics.",
        },
        {
          title: "Checkout ottimizzato",
          desc: "Pagine di checkout veloci e mobile-first con compilazione automatica, salvataggio carte e tasso di conversione massimizzato.",
        },
        {
          title: "Webhook & API",
          desc: "API REST completa e webhook in tempo reale per sincronizzare istantaneamente i tuoi strumenti CRM, email e analytics.",
        },
        {
          title: "Sicurezza & conformità",
          desc: "Autenticazione JWT, chiavi API con scope e audit trail completo per rimanere conformi e sicuri in ogni momento.",
        },
      ],
    },
    how: {
      h2a: "Operativo in",
      h2b: "10 minuti",
      sub: "Nessuna configurazione complessa, nessuno sviluppatore necessario.",
      steps: [
        { n: "01", title: "Crea il tuo store", desc: "Configura il tuo negozio in pochi minuti. Aggiungi prodotti, varianti e prezzi." },
        { n: "02", title: "Collega i processori", desc: "Collega Stripe, PayPal o qualsiasi altro processore e definisci le tue regole di routing." },
        { n: "03", title: "Lancia e incassa", desc: "Condividi il link checkout o integra via API. Ricevi pagamenti in tutto il mondo." },
      ],
    },
    stats: [
      { value: "99,9%", label: "Disponibilità garantita" },
      { value: "< 200ms", label: "Tempo di risposta API" },
      { value: "150+", label: "Valute supportate" },
      { value: "€0", label: "Per iniziare" },
    ],
    pricing: {
      badge: "Prezzi semplici e trasparenti",
      h2a: "Il piano giusto",
      h2b: "per la tua attività.",
      sub: "Inizia gratuitamente, cresci al tuo ritmo. Nessuna sorpresa, nessun vincolo.",
      toggleMonthly: "Mensile",
      toggleAnnual: "Annuale",
      saveLabel: "Risparmia il 20%",
      plans: [
        {
          name: "Starter",
          monthlyPrice: "€0",
          annualPrice: "€0",
          annualNote: "Gratis per sempre",
          desc: "Ideale per testare e lanciare il tuo primo store.",
          cta: "Inizia gratuitamente",
          popular: false,
          features: [
            "1 store",
            "5 prodotti",
            "1 processore di pagamento",
            "Checkout standard",
            "Supporto via email",
          ],
        },
        {
          name: "Pro",
          badge: "Popolare",
          monthlyPrice: "€49",
          annualPrice: "€39",
          annualNote: "/mese, fatturato annualmente",
          desc: "Per i commercianti in crescita che vogliono di più.",
          cta: "Inizia con Pro",
          popular: true,
          features: [
            "5 store",
            "Prodotti illimitati",
            "Routing multi-processore",
            "Checkout personalizzato",
            "Funnel & upsell",
            "Webhook & API",
            "Supporto prioritario",
          ],
        },
        {
          name: "Scale",
          monthlyPrice: "€149",
          annualPrice: "€119",
          annualNote: "/mese, fatturato annualmente",
          desc: "Per team e volumi elevati.",
          cta: "Contatta il team",
          popular: false,
          features: [
            "Store illimitati",
            "Prodotti illimitati",
            "Regole di routing avanzate",
            "Checkout white-label",
            "Analytics avanzati",
            "Integrazioni personalizzate",
            "Account manager dedicato",
          ],
        },
      ],
    },
    cta: {
      h2: "Pronto a ricevere i tuoi primi pagamenti?",
      sub: "Unisciti a centinaia di commercianti che si fidano di LumniPay.",
      primary: "Crea il mio account gratuito",
      secondary: "Hai già un account? Accedi",
      perks: ["Nessuna carta richiesta", "Setup in 10 min", "Supporto incluso"],
    },
    footer: {
      copy: "© 2026 LumniPay. Tutti i diritti riservati.",
      privacy: "Privacy",
      terms: "Termini",
      contact: "Contatto",
    },
  },
};
