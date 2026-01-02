import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/rooms', '/guests', '/reservations', '/settings'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path starts with any of the protected paths
    const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    if (isProtected) {
        const token = request.cookies.get('session')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            // Optionally store the return URL
            return NextResponse.redirect(loginUrl);
        }

        const payload = await verifyToken(token);

        if (!payload) {
            // Invalid token
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Token is valid, allow access
        // We can add header info here if needed
        return NextResponse.next();
    }

    // Public paths
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
    ],
};
