import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) return apiError("storeId is required");

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const products = await prisma.product.findMany({
    where: { storeId },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { storeId, name, description, imageUrl, variants } = body ?? {};

  if (!storeId || !name) return apiError("storeId and name are required");

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const product = await prisma.product.create({
    data: {
      storeId,
      name,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      variants: variants?.length
        ? {
            create: variants.map((v: {
              name: string;
              sku?: string;
              price: number;
              currency?: string;
              recurring?: boolean;
              interval?: string;
              trialDays?: number;
            }) => ({
              name: v.name,
              sku: v.sku ?? null,
              price: v.price,
              currency: v.currency ?? store.baseCurrency,
              recurring: v.recurring ?? false,
              interval: v.interval ?? null,
              trialDays: v.trialDays ?? null,
            })),
          }
        : undefined,
    },
    include: { variants: true },
  });

  return Response.json({ success: true, product }, { status: 201 });
}
