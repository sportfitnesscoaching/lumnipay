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

  const funnels = await prisma.funnel.findMany({
    where: { storeId },
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, funnels });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { storeId, name, slug, paymentFlowId, steps } = body ?? {};

  if (!storeId || !name || !slug) {
    return apiError("storeId, name and slug are required");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const funnel = await prisma.funnel.create({
    data: {
      storeId,
      name,
      slug,
      paymentFlowId: paymentFlowId ?? null,
      steps: steps?.length
        ? {
            create: steps.map((s: {
              order: number;
              type: string;
              config?: object;
            }) => ({
              order: s.order,
              type: s.type,
              config: s.config ?? {},
            })),
          }
        : undefined,
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  return Response.json({ success: true, funnel }, { status: 201 });
}
