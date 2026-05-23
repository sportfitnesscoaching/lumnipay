import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const stores = await prisma.store.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, orders: true, customers: true } } },
  });

  return Response.json({ success: true, stores });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const {
    name, slug, description, platform,
    platformUrl, platformKey, platformSecret,
    baseCurrency, displayCurrency,
    primaryColor, logoUrl, coverImageUrl,
  } = body ?? {};

  if (!name) return apiError("name is required");

  let finalSlug = slug ? slugify(slug) : slugify(name);
  const existing = await prisma.store.findUnique({ where: { slug: finalSlug } });
  if (existing) finalSlug = `${finalSlug}-${Date.now().toString(36)}`;

  const store = await prisma.store.create({
    data: {
      name,
      slug: finalSlug,
      description: description ?? null,
      platform: platform ?? "CUSTOM",
      platformUrl: platformUrl ?? null,
      platformKey: platformKey ?? null,
      platformSecret: platformSecret ?? null,
      baseCurrency: baseCurrency ?? "EUR",
      displayCurrency: displayCurrency ?? baseCurrency ?? "EUR",
      primaryColor: primaryColor ?? "#6366f1",
      logoUrl: logoUrl ?? null,
      coverImageUrl: coverImageUrl ?? null,
      accountId: account.id,
    },
  });

  return Response.json({ success: true, store }, { status: 201 });
}
