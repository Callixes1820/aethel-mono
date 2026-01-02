import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that normally require authentication
const PROTECTED_PATHS = ['/dashboard', '/rooms', '/guests', '/reservations', '/settings'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path starts with any of the protected paths
    const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    if (isProtected) {
        // TEMPORARY FOR SHOWCASE: 
        // Skipped the token check and redirect logic so visitors can see the dashboard.
        return NextResponse.next();
    }

    // Public paths
    return NextResponse.next();
}

export const config = {
    matcher: [

        '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
    ],
};
