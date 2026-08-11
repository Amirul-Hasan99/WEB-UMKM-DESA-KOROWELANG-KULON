import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Jika user mengakses root /dashboard, arahkan sesuai role-nya
    if (pathname === "/dashboard") {
      if (token?.role === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/dashboard/superadmin", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }
    }

    // Mencegah ADMIN biasa mengakses halaman SUPERADMIN
    if (pathname.startsWith("/dashboard/superadmin") && token?.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
