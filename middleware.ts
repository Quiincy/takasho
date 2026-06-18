import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/supabase-middleware'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = redirectUrl.hostname.replace('www.', '');
    return NextResponse.redirect(redirectUrl, 301);
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
