import { auth } from "@/lib/auth/auth";

async function verifyHMAC(code: string, signature: string, timestamp: number, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const allowedSkew = 40;

  if (Math.abs(currentTimestamp - timestamp) > allowedSkew) {
    throw new Error("Request expired or timestamp is invalid");
  }

  // Import key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const message = `${code}:${timestamp}`;
  const signatureBytes = Uint8Array.from(Buffer.from(signature, 'hex'));

  const verified = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(message)
  );

  return verified;
}

export default auth(async (req, res) => {
  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith("/protected")) {
      const newUrl = new URL("/sign-in", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    if (req.nextUrl.pathname.startsWith("/api") && !req.nextUrl.pathname.startsWith("/api/auth")) {
      const params = new URLSearchParams(req.nextUrl.search);
      const code = params.get("code");
      const signature = params.get("signature");
      const timestamp = parseInt(params.get("timestamp")!);
      const SECRET_SALT = process.env.SALT_KEY;
      
      if (!code || !signature || !SECRET_SALT) {
        return new Response("Unauthorized", { status: 401 });
      }

      const isValid = await verifyHMAC(code, signature, timestamp, SECRET_SALT);

      if (!isValid) {
        return new Response("Invalid signature", { status: 403 });
      } else {
        return;
      }
    }
  }

  if (req.auth && req.nextUrl.pathname === "/sign-in") {
    const newUrl = new URL("/protected/student-snapshot", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})