import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const domains = await prisma.customDomain.findMany({
    where: { accountId: account.id },
    include: { store: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, domains });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { domain, storeId } = body ?? {};

  if (!domain) return apiError("domain is required");

  const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (storeId) {
    const store = await prisma.store.findFirst({ where: { id: storeId, accountId: account.id } });
    if (!store) return apiError("Store not found", 404);
  }

  try {
    const created = await prisma.customDomain.create({
      data: {
        domain: clean,
        accountId: account.id,
        storeId: storeId ?? null,
      },
      include: { store: { select: { id: true, name: true, slug: true } } },
    });
    return Response.json({ success: true, domain: created }, { status: 201 });
  } catch {
    return apiError("Ce domaine est déjà enregistré");
  }
}
