import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, apiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return apiError("email and password are required");
  }

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account) return apiError("Invalid credentials", 401);

  const valid = await comparePassword(password, account.password);
  if (!valid) return apiError("Invalid credentials", 401);

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
  });
}
