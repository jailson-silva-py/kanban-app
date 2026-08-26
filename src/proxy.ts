import { auth } from "auth";
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const isLogged = await auth();
  const isVerified = isLogged?.user.emailVerified || isLogged?.user.provider;
  const privateRoutes = ["/home", "/profile", "/board"];
  const publicRoutes = ["/login", "/signin"]

  const isOnPrivateRoutes = privateRoutes.some((route) => {
    return request.nextUrl.pathname.startsWith(route)
  })
  const isOnPublicRoutes = publicRoutes.some((route) => {
    return request.nextUrl.pathname.startsWith(route)
  })
  if (isOnPrivateRoutes) {
    if (!isLogged) {
      return NextResponse.redirect(new URL("/login", request.url))
    } else if (isLogged && !isVerified) {
      return NextResponse.redirect(new URL("/signin/verify", request.url))
    }
    return
  }

  if (isOnPublicRoutes) {
    if (isLogged && isVerified) {
      return NextResponse.redirect(new URL("/home", request.url))
    };
    return
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
