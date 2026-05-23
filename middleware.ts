import { NextRequest, NextResponse } from "next/server";

async function verifyHMAC(code: string, signature: string, timestamp: number, secret: string): Promise<boolean> {
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

function hasSessionCookie(req: NextRequest): boolean {
  return !!(
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token")
  );
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Block calendar paths that expose email addresses
  if (pathname.startsWith("/calendar/") && pathname.includes("@")) {
    return new Response("Not Found", { status: 404 });
  }

  // Cookie-presence check: fast UX guard (actual DB validation is in protected/layout.tsx)
  const authenticated = hasSessionCookie(req);

  if (!authenticated && pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  if (authenticated && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/protected/student-snapshot", req.nextUrl.origin));
  }

  const method = req.method;

  // Public API paths — allow unauthenticated access
  if (
    pathname.startsWith("/api/schedules/public") ||
    (pathname.startsWith("/api/users/") && method === "GET") ||
    (pathname === "/api/bookings" && method === "POST")
  ) {
    return NextResponse.next();
  }

  // Non-auth API routes: authenticated users pass through, others need valid HMAC
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (authenticated) return NextResponse.next();

    const params = new URLSearchParams(req.nextUrl.search);
    const code = params.get("code");
    const signature = params.get("signature");
    const timestamp = parseInt(params.get("timestamp") ?? "0");
    const SECRET_SALT = process.env.SALT_KEY;

    if (!code || !signature || !SECRET_SALT) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const isValid = await verifyHMAC(code, signature, timestamp, SECRET_SALT);
      if (!isValid) return new Response("Invalid signature", { status: 403 });
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
