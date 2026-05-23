import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);
  if (account.email !== "admin@lumnipay.com") return apiError("Forbidden", 403);

  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { stores: true, apiKeys: true } } },
  });

  return Response.json({
    success: true,
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      plan: a.plan,
      storeCount: a._count.stores,
      apiKeyCount: a._count.apiKeys,
      createdAt: a.createdAt,
    })),
  });
}
