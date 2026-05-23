import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Account } from "@/generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

export function signToken(accountId: string): string {
  return jwt.sign({ sub: accountId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAccountFromRequest(
  req: NextRequest
): Promise<Account | null> {
  // Try Bearer token (JWT)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // Try JWT first
    const payload = verifyToken(token);
    if (payload) {
      return prisma.account.findUnique({ where: { id: payload.sub } });
    }

    // Try API key
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: { account: true },
    });
    if (apiKey) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() },
      });
      return apiKey.account;
    }
  }

  return null;
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
