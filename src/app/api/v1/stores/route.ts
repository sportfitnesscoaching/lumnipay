import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const stores = await prisma.store.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, stores });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, baseCurrency, displayCurrency, domain, logoUrl } = body ?? {};

  if (!name) return apiError("name is required");

  const store = await prisma.store.create({
    data: {
      name,
      baseCurrency: baseCurrency ?? "USD",
      displayCurrency: displayCurrency ?? baseCurrency ?? "USD",
      domain: domain ?? null,
      logoUrl: logoUrl ?? null,
      accountId: account.id,
    },
  });

  return Response.json({ success: true, store }, { status: 201 });
}
