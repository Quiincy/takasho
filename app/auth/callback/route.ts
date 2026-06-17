import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/admin/update-password'

  // Допоміжна функція для правильного редіректу (враховує Cloud Run проксі)
  const getRedirectUrl = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = '' // очищаємо старі параметри
    return url
  }

  // Перевірка через OTP (Invite або Recovery)
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })
    
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(next))
    }
  }

  // Перевірка через PKCE Flow (код)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(next))
    }
  }

  return NextResponse.redirect(getRedirectUrl('/admin'))
}
