import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/ids";

type Params = Promise<{ token: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { token } = await params;
  const body = await req.json();
  const { email, firstName, lastName, phone, card } = body ?? {};

  if (!email) return apiError("email is required");

  const session = await prisma.checkoutSession.findUnique({
    where: { token },
    include: {
      store: true,
      funnel: { include: { steps: { orderBy: { order: "asc" } } } },
    },
  });

  if (!session) return apiError("Session not found", 404);
  if (session.status !== "PENDING") return apiError("Session already completed", 410);
  if (session.expiresAt < new Date()) return apiError("Session expired", 410);

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { storeId_email: { storeId: session.storeId, email } },
    create: { storeId: session.storeId, email, firstName: firstName ?? null, lastName: lastName ?? null, phone: phone ?? null },
    update: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone && { phone }) },
  });

  // Compute total from items
  const items = session.items as Array<{ variantId: string; quantity: number; price: number }>;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Get default processor for account
  const processor = await prisma.processor.findFirst({
    where: { account: { stores: { some: { id: session.storeId } } }, active: true },
    orderBy: { createdAt: "asc" },
  });

  // Create order
  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      storeId: session.storeId,
      customerId: customer.id,
      currency: session.currency,
      subtotal: total,
      total,
      status: "PENDING",
    },
  });

  // Create order items
  await Promise.all(
    items.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { productId: true },
      });
      if (!variant) return;
      return prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: variant.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          currency: session.currency,
        },
      });
    })
  );

  // Process payment (sandbox simulation or real processor)
  const isSandbox = !processor || processor.type === "SANDBOX";
  const processorRef = isSandbox
    ? `sandbox_${Date.now()}`
    : await chargeRealProcessor(processor!, card, total, session.currency);

  const paymentStatus = isSandbox ? "CAPTURED" : "CAPTURED";

  const payment = await prisma.payment.create({
    data: {
      storeId: session.storeId,
      orderId: order.id,
      customerId: customer.id,
      processorId: processor?.id ?? null,
      amount: total,
      currency: session.currency,
      status: paymentStatus as never,
      initiatedBy: "CUSTOMER",
      processorRef,
      transactions: {
        create: { type: "SALE", amount: total, currency: session.currency, status: "CAPTURED", processorRef },
      },
    },
  });

  // Update order & session
  await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
  await prisma.checkoutSession.update({
    where: { token },
    data: { status: "COMPLETED", customerId: customer.id, orderId: order.id },
  });

  // Determine next step URL
  const nextStepUrl = getNextStepUrl(session, order.id);

  // Fire webhook event (fire-and-forget)
  fireWebhookEvent(session.storeId, "payment.captured", { paymentId: payment.id, orderId: order.id, amount: total, currency: session.currency });

  return Response.json({
    success: true,
    orderId: order.id,
    paymentId: payment.id,
    nextUrl: nextStepUrl,
  });
}

function getNextStepUrl(session: { funnel: { steps: Array<{ type: string; order: number }> } | null; token: string }, orderId: string): string {
  const thankYouStep = session.funnel?.steps.find((s) => s.type === "THANK_YOU");
  const upsellStep = session.funnel?.steps.find((s) => s.type === "UPSELL");

  if (upsellStep) return `/checkout/${session.token}/upsell`;
  return `/checkout/${session.token}/success?orderId=${orderId}`;
}

async function chargeRealProcessor(
  processor: { type: string; options: unknown },
  card: { number: string; expMonth: string; expYear: string; cvc: string } | undefined,
  amount: number,
  currency: string
): Promise<string> {
  // Stripe integration placeholder — to be implemented
  if (processor.type === "STRIPE") {
    // const stripe = new Stripe((processor.options as { secretKey: string }).secretKey);
    // const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    // return paymentIntent.id;
    return `pi_sandbox_${Date.now()}`;
  }
  return `ref_${Date.now()}`;
}

async function fireWebhookEvent(storeId: string, eventType: string, payload: unknown) {
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { accountId: true } });
    if (!store) return;
    const webhooks = await prisma.webhook.findMany({
      where: { accountId: store.accountId, active: true, events: { has: eventType } },
    });
    for (const wh of webhooks) {
      fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-LumniPay-Event": eventType },
        body: JSON.stringify({ event: eventType, data: payload, timestamp: Date.now() }),
      }).catch(() => {});
    }
  } catch { /* silent */ }
}
