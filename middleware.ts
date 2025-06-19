import { auth } from "@/lib/auth/auth"
 
export default auth((req) => {
  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith("/protected")) {
      const newUrl = new URL("/sign-in", req.nextUrl.origin)
      return Response.redirect(newUrl)
    }
    else if (req.nextUrl.pathname.startsWith("/api") && !req.nextUrl.pathname.startsWith("/api/auth")) {
      const newUrl = new URL("/sign-in", req.nextUrl.origin)
      return Response.redirect(newUrl)
    }
  }

  if (req.auth && req.nextUrl.pathname === "/sign-in") {
    const newUrl = new URL("/protected/student-snapshot", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})