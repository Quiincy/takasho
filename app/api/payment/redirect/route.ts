import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const data = params.get('data');
    const signature = params.get('signature');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    if (!data || !signature) {
      return NextResponse.redirect(`${baseUrl}/cart?payment=error`);
    }

    const liqpayPrivateKey = process.env.LIQPAY_PRIVATE_KEY || 'sandbox_private_key';
    const signString = liqpayPrivateKey + data + liqpayPrivateKey;
    const expectedSignature = crypto.createHash('sha1').update(signString).digest('base64');

    if (signature !== expectedSignature) {
      return NextResponse.redirect(`${baseUrl}/cart?payment=error`);
    }

    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const status = decodedData.status;

    if (status === 'success' || status === 'wait_accept' || status === 'sandbox') {
      return NextResponse.redirect(`${baseUrl}/cart?payment=success`);
    } else {
      return NextResponse.redirect(`${baseUrl}/cart?payment=error`);
    }
  } catch (err) {
    console.error('LiqPay redirect error:', err);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/cart?payment=error`);
  }
}
