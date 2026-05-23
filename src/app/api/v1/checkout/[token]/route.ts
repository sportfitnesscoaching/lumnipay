import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/auth";

type Params = Promise<{ token: string }>;

// Public — no auth required
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { token } = await params;

  const session = await prisma.checkoutSession.findUnique({
    where: { token },
    include: {
      store: { select: { id: true, name: true, logoUrl: true, baseCurrency: true } },
      funnel: { include: { steps: { orderBy: { order: "asc" } } } },
    },
  });

  if (!session) return apiError("Session not found", 404);
  if (session.status !== "PENDING") return apiError("Session is no longer active", 410);
  if (session.expiresAt < new Date()) {
    await prisma.checkoutSession.update({ where: { token }, data: { status: "EXPIRED" } });
    return apiError("Session expired", 410);
  }

  // Enrich items with product/variant data
  const items = session.items as Array<{ variantId: string; quantity: number; price?: number }>;
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { name: true, imageUrl: true, description: true } } },
      });
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price ?? variant?.price ?? 0,
        currency: variant?.currency ?? session.currency,
        productName: variant?.product.name ?? "Produit",
        variantName: variant?.name ?? "",
        imageUrl: variant?.product.imageUrl ?? null,
        description: variant?.product.description ?? null,
        recurring: variant?.recurring ?? false,
        interval: variant?.interval ?? null,
      };
    })
  );

  const subtotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return Response.json({
    success: true,
    session: {
      id: session.id,
      token: session.token,
      currency: session.currency,
      expiresAt: session.expiresAt,
      store: session.store,
      items: enrichedItems,
      subtotal,
      metadata: session.metadata,
    },
  });
}
