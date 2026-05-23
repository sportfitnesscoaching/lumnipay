import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

type Params = Promise<{ domainId: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { domainId } = await params;
  const cd = await prisma.customDomain.findFirst({ where: { id: domainId, accountId: account.id } });
  if (!cd) return apiError("Domain not found", 404);

  const body = await req.json();
  const { action, storeId } = body ?? {};

  if (action === "verify") {
    const updated = await prisma.customDomain.update({
      where: { id: domainId },
      data: { isVerified: true, enabled: true },
      include: { store: { select: { id: true, name: true, slug: true } } },
    });
    return Response.json({ success: true, domain: updated });
  }

  if (action === "disable") {
    const updated = await prisma.customDomain.update({
      where: { id: domainId },
      data: { enabled: false },
      include: { store: { select: { id: true, name: true, slug: true } } },
    });
    return Response.json({ success: true, domain: updated });
  }

  if (storeId !== undefined) {
    if (storeId) {
      const store = await prisma.store.findFirst({ where: { id: storeId, accountId: account.id } });
      if (!store) return apiError("Store not found", 404);
    }
    const updated = await prisma.customDomain.update({
      where: { id: domainId },
      data: { storeId: storeId || null },
      include: { store: { select: { id: true, name: true, slug: true } } },
    });
    return Response.json({ success: true, domain: updated });
  }

  return apiError("Unknown action");
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { domainId } = await params;
  const cd = await prisma.customDomain.findFirst({ where: { id: domainId, accountId: account.id } });
  if (!cd) return apiError("Domain not found", 404);

  await prisma.customDomain.delete({ where: { id: domainId } });
  return Response.json({ success: true });
}
