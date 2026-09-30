import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

/**
 * Returns the first non-internal IPv4 address of the dev machine so the
 * frontend can build a QR URL reachable from a mobile phone on the same LAN.
 */
export function GET() {
  const interfaces = os.networkInterfaces();
  let ip: string | null = null;
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] ?? []) {
      if (info.family === 'IPv4' && !info.internal) {
        ip = info.address;
        break;
      }
    }
    if (ip) break;
  }
  return NextResponse.json({ ip });
}
