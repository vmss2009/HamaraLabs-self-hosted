import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server";

async function verifyHMAC(code: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"));
  const verified = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(code)
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
      const SECRET_SALT = process.env.SALT_KEY;
      
      if (!code || !signature || !SECRET_SALT) {
        return new Response("Unauthorized", { status: 401 });
      }
      
      const isValid = await verifyHMAC(code, signature, SECRET_SALT);
      
      if (!isValid) {
        return new Response("Invalid signature", { status: 403 });
      } else {
        console.log(isValid);
        return;
      }
    }
  }

  if (req.auth && req.nextUrl.pathname === "/sign-in") {
    const newUrl = new URL("/protected/student-snapshot", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

// export function middleware() {
//     const res = NextResponse.next();

//     res.headers.append('Access-Control-Allow-Credentials', "true");
//     res.headers.append('Access-Control-Allow-Origin', '*'); 
//     res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
//     res.headers.append(
//         'Access-Control-Allow-Headers',
//         'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//     )

//     return res
// }