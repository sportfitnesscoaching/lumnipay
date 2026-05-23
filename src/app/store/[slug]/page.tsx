import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Zap, Package } from "lucide-react";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) return { title: "Store introuvable" };
  return { title: `${store.name} — LumniPay`, description: store.description ?? undefined };
}

export default async function StorePage({ params }: { params: Params }) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        include: { variants: { orderBy: { price: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) notFound();

  const color = store.primaryColor ?? "#6366f1";
  const hasLogo = !!store.logoUrl;

  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount / 100);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: color }} className="text-white">
        {store.coverImageUrl && (
          <div className="h-48 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.coverImageUrl} alt="" className="w-full h-full object-cover opacity-60" />
          </div>
        )}
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-5">
          {hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl!} alt={store.name} className="w-16 h-16 rounded-2xl object-cover bg-white/20" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {store.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{store.name}</h1>
            {store.description && <p className="text-white/70 mt-1">{store.description}</p>}
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {store.products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Aucun produit disponible pour l&apos;instant.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {store.products.length} produit{store.products.length > 1 ? "s" : ""}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {store.products.map((product) => {
                const lowestVariant = product.variants[0];
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200 transition-all group">
                    {/* Image */}
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {product.images[0] || product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0] ?? product.imageUrl!}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-base">{product.name}</h3>
                      {product.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                      )}

                      {/* Variants */}
                      {product.variants.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {product.variants.map((v) => (
                            <div key={v.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{v.name}</span>
                              <span className="font-bold text-gray-900">
                                {formatPrice(v.price, v.currency)}
                                {v.recurring && (
                                  <span className="text-xs font-normal text-gray-400 ml-1">
                                    /{v.interval ?? "mo"}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {lowestVariant && (
                        <button
                          style={{ backgroundColor: color }}
                          className="mt-5 w-full text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Acheter — {formatPrice(lowestVariant.price, lowestVariant.currency)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>Propulsé par</span>
          <Link href="/" className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            LumniPay
          </Link>
        </div>
      </footer>
    </div>
  );
}
