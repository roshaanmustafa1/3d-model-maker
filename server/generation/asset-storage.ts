import fs from 'fs'
import path from 'path'

const ASSETS_DIR = path.join(process.cwd(), '.storage', 'generation', 'assets')

function ensureAssetsDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true })
  }
}

export function getAssetFilePath(jobId: string, assetType: string): string {
  ensureAssetsDir()
  const sanitizedJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const sanitizedType = assetType.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(ASSETS_DIR, `${sanitizedJobId}_${sanitizedType}.bin`)
}

export function getAssetMetaPath(jobId: string, assetType: string): string {
  ensureAssetsDir()
  const sanitizedJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const sanitizedType = assetType.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(ASSETS_DIR, `${sanitizedJobId}_${sanitizedType}.meta.json`)
}

export async function saveAsset(
  jobId: string,
  assetType: 'original_glb' | 'processed_glb' | 'thumbnail' | string,
  data: ArrayBuffer | Buffer,
  contentType = 'model/gltf-binary'
): Promise<string> {
  ensureAssetsDir()
  const filePath = getAssetFilePath(jobId, assetType)
  const metaPath = getAssetMetaPath(jobId, assetType)

  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)

  await fs.promises.writeFile(filePath, buffer)
  await fs.promises.writeFile(
    metaPath,
    JSON.stringify(
      {
        jobId,
        assetType,
        size: buffer.length,
        contentType,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  )

  return getAssetLocalUrl(jobId, assetType)
}

export async function getAsset(
  jobId: string,
  assetType: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const filePath = getAssetFilePath(jobId, assetType)
  const metaPath = getAssetMetaPath(jobId, assetType)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const buffer = await fs.promises.readFile(filePath)
  let contentType = 'application/octet-stream'

  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf8'))
      if (meta.contentType) contentType = meta.contentType
    } catch {
      // fallback
    }
  }

  return { buffer, contentType }
}

export async function deleteJobAssets(jobId: string): Promise<void> {
  ensureAssetsDir()
  const sanitizedJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const files = await fs.promises.readdir(ASSETS_DIR)

  for (const file of files) {
    if (file.startsWith(`${sanitizedJobId}_`)) {
      try {
        await fs.promises.unlink(path.join(ASSETS_DIR, file))
      } catch {
        // ignore deletion errors
      }
    }
  }
}

export function getAssetLocalUrl(jobId: string, assetType: string): string {
  return `/api/ai/jobs/${encodeURIComponent(jobId)}/assets/${encodeURIComponent(assetType)}`
}
