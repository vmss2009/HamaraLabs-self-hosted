// Edge-compatible (Web Crypto only): imported by middleware.ts as well as route handlers.
export async function verifyHMAC(code: string, signature: string, timestamp: number, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const allowedSkew = 40;

  if (Math.abs(currentTimestamp - timestamp) > allowedSkew) {
    throw new Error("Request expired or timestamp is invalid");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const message = `${code}:${timestamp}`;
  const hex = signature.replace(/[^0-9a-f]/gi, "");
  const signatureBytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    signatureBytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(message));
}

export async function hasValidHMAC(params: URLSearchParams): Promise<boolean> {
  const code = params.get("code");
  const signature = params.get("signature");
  const timestamp = parseInt(params.get("timestamp") ?? "0");
  const secret = process.env.SALT_KEY;

  if (!code || !signature || !secret) return false;

  try {
    return await verifyHMAC(code, signature, timestamp, secret);
  } catch {
    return false;
  }
}
