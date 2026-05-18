/**
 * middleware.ts
 *
 * Reads the httpOnly JWT cookie set by FastAPI (`atomquest_token`) and
 * extracts the role from the payload to enforce route-level access control.
 *
 * NOTE: This does NOT cryptographically verify the JWT — that is done by
 * FastAPI on every API call. Here we only do role-based routing so the
 * user lands on the right dashboard and cross-role access is blocked.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Decode a JWT payload without verifying the signature (routing only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json    = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Public routes — never require auth ──────────────────────────────────
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/unauthorized')
  ) {
    return NextResponse.next();
  }

  // ── Read the JWT cookie set by the FastAPI backend ───────────────────────
  const jwtCookie = request.cookies.get('atomquest_token');

  if (!jwtCookie?.value) {
    // No token → redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeJwtPayload(jwtCookie.value);

  if (!payload) {
    // Token is malformed — clear and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('atomquest_token');
    return response;
  }

  // Check expiry (exp is in seconds)
  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('atomquest_token');
    return response;
  }

  const role = payload.role as string | undefined; // "EMPLOYEE" | "MANAGER" | "ADMIN"

  // ── Role isolation — prevent cross-role access ───────────────────────────
  if (pathname.startsWith('/employee') && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/manager') && role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
