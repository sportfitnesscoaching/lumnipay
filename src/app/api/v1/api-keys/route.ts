import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";
import { generateApiKey } from "@/lib/ids";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const keys = await prisma.apiKey.findMany({
    where: { accountId: account.id },
    select: {
      id: true,
      name: true,
      key: true,
      lastUsed: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, apiKeys: keys });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, expiresAt } = body ?? {};

  if (!name) return apiError("name is required");

  const apiKey = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      name,
      accountId: account.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return Response.json({ success: true, apiKey }, { status: 201 });
}
