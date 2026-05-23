import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

type Params = Promise<{ storeId: string }>;

async function getStore(storeId: string, accountId: string) {
  return prisma.store.findFirst({ where: { id: storeId, accountId } });
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { storeId } = await params;
  const store = await getStore(storeId, account.id);
  if (!store) return apiError("Store not found", 404);

  return Response.json({ success: true, store });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { storeId } = await params;
  const store = await getStore(storeId, account.id);
  if (!store) return apiError("Store not found", 404);

  const body = await req.json();
  const { name, baseCurrency, displayCurrency, domain, logoUrl } = body ?? {};

  const updated = await prisma.store.update({
    where: { id: storeId },
    data: {
      ...(name && { name }),
      ...(baseCurrency && { baseCurrency }),
      ...(displayCurrency && { displayCurrency }),
      ...(domain !== undefined && { domain }),
      ...(logoUrl !== undefined && { logoUrl }),
    },
  });

  return Response.json({ success: true, store: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { storeId } = await params;
  const store = await getStore(storeId, account.id);
  if (!store) return apiError("Store not found", 404);

  await prisma.store.delete({ where: { id: storeId } });

  return Response.json({ success: true });
}
