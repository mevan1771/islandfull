import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing ID parameter', { status: 400 })
    }

    // Generate the QR code as a PNG buffer
    const qrBuffer = await QRCode.toBuffer(id, {
      type: 'png',
      width: 250,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    return new NextResponse(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('QR Generation Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
