import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const flows = await prisma.paymentFlow.findMany({
    where: { accountId: account.id },
    include: {
      processors: {
        include: {
          processor: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, paymentFlows: flows });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, strategy, processors } = body ?? {};

  if (!name) return apiError("name is required");

  const flow = await prisma.paymentFlow.create({
    data: {
      name,
      strategy: strategy ?? "SIMPLE",
      accountId: account.id,
      processors: processors?.length
        ? {
            create: processors.map((p: {
              processorId: string;
              priority?: number;
              percentage?: number;
            }) => ({
              processorId: p.processorId,
              priority: p.priority ?? 0,
              percentage: p.percentage ?? null,
            })),
          }
        : undefined,
    },
    include: {
      processors: {
        include: {
          processor: { select: { id: true, name: true, type: true } },
        },
      },
    },
  });

  return Response.json({ success: true, paymentFlow: flow }, { status: 201 });
}
