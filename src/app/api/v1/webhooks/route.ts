import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";
import { generateWebhookSecret } from "@/lib/ids";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const webhooks = await prisma.webhook.findMany({
    where: { accountId: account.id },
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
      // never expose secret
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, webhooks });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { url, events } = body ?? {};

  if (!url || !events?.length) {
    return apiError("url and events are required");
  }

  const webhook = await prisma.webhook.create({
    data: {
      url,
      events,
      secret: generateWebhookSecret(),
      accountId: account.id,
    },
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      secret: true, // show once on creation
      createdAt: true,
    },
  });

  return Response.json({ success: true, webhook }, { status: 201 });
}
