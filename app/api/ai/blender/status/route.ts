import { NextResponse } from 'next/server'
import { detectBlenderInstallation } from '@/server/blender/blender-worker-client'

export async function GET() {
  try {
    const status = await detectBlenderInstallation()
    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to query Blender status' },
      { status: 500 }
    )
  }
}
