import { NextResponse } from 'next/server';

export async function GET() {
    const pubKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'MISSING';
    const hasSecret = !!process.env.WOMPI_INTEGRITY_SECRET;
    const secretPreview = process.env.WOMPI_INTEGRITY_SECRET
        ? `${process.env.WOMPI_INTEGRITY_SECRET.substring(0, 8)}... (len: ${process.env.WOMPI_INTEGRITY_SECRET.length})`
        : 'MISSING';

    return NextResponse.json({
        publicKey: pubKey,
        hasIntegritySecret: hasSecret,
        integritySecretPreview: secretPreview,
        node_env: process.env.NODE_ENV
    });
}
