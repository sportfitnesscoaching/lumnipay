import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  if (!storeId) return apiError("storeId is required");

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where: { storeId } }),
  ]);

  return Response.json({
    success: true,
    customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { storeId, email, firstName, lastName, phone, tags, metadata } =
    body ?? {};

  if (!storeId || !email) return apiError("storeId and email are required");

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const customer = await prisma.customer.upsert({
    where: { storeId_email: { storeId, email } },
    create: {
      storeId,
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
      tags: tags ?? [],
      metadata: metadata ?? null,
    },
    update: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(tags && { tags }),
      ...(metadata !== undefined && { metadata }),
    },
  });

  return Response.json({ success: true, customer }, { status: 201 });
}
