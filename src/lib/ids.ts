import { v4 as uuidv4 } from "uuid";

export function generateApiKey(): string {
  return `lp_${uuidv4().replace(/-/g, "")}`;
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export function generateWebhookSecret(): string {
  return `whsec_${uuidv4().replace(/-/g, "")}`;
}
