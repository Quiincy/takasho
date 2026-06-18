import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/supabase-middleware'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const newUrl = `${protocol}://${newHost}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(newUrl, 301);
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
