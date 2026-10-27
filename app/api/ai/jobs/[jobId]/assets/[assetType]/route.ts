import { NextRequest, NextResponse } from 'next/server'
import { getAsset } from '@/server/generation/asset-storage'

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params:
      | Promise<{ jobId: string; assetType: string }>
      | { jobId: string; assetType: string }
  }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { jobId, assetType } = resolvedParams

    const asset = await getAsset(jobId, assetType)
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const uint8 = new Uint8Array(asset.buffer)

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Content-Length': asset.buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Asset streaming failed' },
      { status: 500 }
    )
  }
}
