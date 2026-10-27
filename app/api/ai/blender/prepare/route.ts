import { executeBlenderJob } from '@/server/blender/blender-worker-client'
import { inspectGlbContainer } from '@/engine/loaders/glb-integrity'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length')) > 100 * 1024 * 1024) return Response.json({ error: 'GLB exceeds 100 MB.' }, { status: 413 })
  try {
    const buffer = await request.arrayBuffer()
    if (buffer.byteLength > 100 * 1024 * 1024) return Response.json({ error: 'GLB exceeds 100 MB.' }, { status: 413 })
    inspectGlbContainer(buffer)
    const result = await executeBlenderJob(buffer, { recalculateNormals: false, smartUvUnwrap: true, onlyMissingUVs: true })
    if (!result.success || !result.processedGlbBuffer) return Response.json({ error: result.error || 'Blender produced no asset.' }, { status: 503 })
    inspectGlbContainer(result.processedGlbBuffer)
    return new Response(result.processedGlbBuffer, { headers: { 'Content-Type': 'model/gltf-binary', 'Cache-Control': 'no-store' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Invalid GLB.' }, { status: 400 })
  }
}
