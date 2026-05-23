import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/ids";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  // Resolve store IDs belonging to this account
  const storeWhere = storeId
    ? { id: storeId, accountId: account.id }
    : { accountId: account.id };

  const stores = await prisma.store.findMany({
    where: storeWhere,
    select: { id: true },
  });
  const storeIds = stores.map((s: { id: string }) => s.id);

  const where = {
    storeId: { in: storeIds },
    ...(status && { status: status as never }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return Response.json({
    success: true,
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const {
    storeId,
    amount,
    currency,
    processorId,
    customerId,
    paymentInstrumentId,
    metadata,
    initiatedBy,
  } = body ?? {};

  if (!storeId || !amount || !currency || !processorId) {
    return apiError("storeId, amount, currency and processorId are required");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, accountId: account.id },
  });
  if (!store) return apiError("Store not found", 404);

  const processor = await prisma.processor.findFirst({
    where: { id: processorId, accountId: account.id },
  });
  if (!processor) return apiError("Processor not found", 404);

  // Create order
  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      storeId,
      customerId: customerId ?? null,
      currency,
      subtotal: amount,
      total: amount,
    },
  });

  // Process payment (sandbox mode — real integrations go here)
  const isSandbox = processor.type === "SANDBOX";
  const processorRef = isSandbox ? `sandbox_${Date.now()}` : null;
  const paymentStatus = isSandbox ? "CAPTURED" : "PENDING";

  const payment = await prisma.payment.create({
    data: {
      storeId,
      orderId: order.id,
      customerId: customerId ?? null,
      processorId,
      paymentInstrumentId: paymentInstrumentId ?? null,
      amount,
      currency,
      status: paymentStatus as never,
      initiatedBy: (initiatedBy ?? "CUSTOMER") as never,
      processorRef,
      metadata: metadata ?? null,
      transactions: {
        create: {
          type: "SALE",
          amount,
          currency,
          status: paymentStatus,
          processorRef,
        },
      },
    },
    include: { transactions: true },
  });

  if (isSandbox) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
  }

  return Response.json(
    { success: true, payment, order },
    { status: 201 }
  );
}
