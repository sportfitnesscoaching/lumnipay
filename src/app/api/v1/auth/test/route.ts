import { NextRequest } from "next/server";
import { getAccountFromRequest, apiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req);
  if (!account) return apiError("Unauthorized", 401);

  return Response.json({
    success: true,
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      plan: account.plan,
    },
  });
}
