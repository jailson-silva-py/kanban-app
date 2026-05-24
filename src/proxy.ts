import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const privateRoutes = ["/home", "/profile"];
const publicRoutes = ["/login", "/signin"]

export default async function proxy(req:NextRequest) {

    const token = await getToken({req, secret:process.env.AUTH_SECRET})

    const { pathname } = req.nextUrl;

    const isPrivateRoute = privateRoutes.some((route) =>{

        return pathname.startsWith(route)

    });

    const isPublicRoute = publicRoutes.some(route => {

        return pathname.startsWith(route)

    })

    if (isPrivateRoute && !token) {

        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl);

    }

    if (token && isPublicRoute) {

        return NextResponse.redirect(new URL("/home", req.url))

    }

    return NextResponse.next()
}

export const config = {

    matcher:["/((?!api|_next/static|_next/image|favicon.ico).*)"],

}
