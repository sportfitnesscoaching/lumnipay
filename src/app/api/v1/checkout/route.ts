import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { storeId, funnelId, items, currency, metadata, expiresInMinutes } =
    body ?? {};

  if (!storeId || !items?.length) {
    return apiError("storeId and items are required");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const expiresAt = new Date(
    Date.now() + (expiresInMinutes ?? 60) * 60 * 1000
  );

  const session = await prisma.checkoutSession.create({
    data: {
      storeId,
      funnelId: funnelId ?? null,
      items,
      currency: currency ?? store.baseCurrency,
      metadata: metadata ?? null,
      expiresAt,
    },
  });

  return Response.json(
    {
      success: true,
      session: {
        id: session.id,
        token: session.token,
        status: session.status,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${session.token}`,
        expiresAt: session.expiresAt,
      },
    },
    { status: 201 }
  );
}
