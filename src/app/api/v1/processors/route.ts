import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const processors = await prisma.processor.findMany({
    where: { accountId: account.id },
    select: {
      id: true,
      name: true,
      type: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      // never return options (contains credentials)
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ success: true, processors });
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, type, options } = body ?? {};

  if (!name || !type) return apiError("name and type are required");

  const validTypes = ["STRIPE", "NMI", "ADYEN", "BRAINTREE", "SANDBOX"];
  if (!validTypes.includes(type)) {
    return apiError(`type must be one of: ${validTypes.join(", ")}`);
  }

  const processor = await prisma.processor.create({
    data: {
      name,
      type,
      options: options ?? {},
      accountId: account.id,
    },
    select: {
      id: true,
      name: true,
      type: true,
      active: true,
      createdAt: true,
    },
  });

  return Response.json({ success: true, processor }, { status: 201 });
}
