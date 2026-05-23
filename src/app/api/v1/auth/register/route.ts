import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, apiError } from "@/lib/auth";
import { generateApiKey } from "@/lib/ids";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body ?? {};

  if (!name || !email || !password) {
    return apiError("name, email and password are required");
  }

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) return apiError("Email already in use", 409);

  const hashed = await hashPassword(password);
  const account = await prisma.account.create({
    data: {
      name,
      email,
      password: hashed,
      apiKeys: {
        create: {
          key: generateApiKey(),
          name: "Default",
        },
      },
    },
    include: { apiKeys: true },
  });

  const token = signToken(account.id);

  return Response.json({
    success: true,
    token,
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      plan: account.plan,
    },
    apiKey: account.apiKeys[0].key,
  });
}
