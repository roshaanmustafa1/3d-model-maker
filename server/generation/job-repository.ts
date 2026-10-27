import fs from 'fs'
import path from 'path'
import { GenerationJob } from '@/types/ai-generator'
import { randomUUID } from 'crypto'

const STORAGE_DIR = path.join(process.cwd(), '.storage', 'generation')
const JOBS_FILE = path.join(STORAGE_DIR, 'jobs.json')
const JOBS_LOCK_FILE = path.join(STORAGE_DIR, 'jobs.lock')

function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

let inMemoryCache: Map<string, GenerationJob> | null = null

async function loadFromDisk(): Promise<Map<string, GenerationJob>> {
  ensureDir()
  if (!fs.existsSync(JOBS_FILE)) {
    inMemoryCache = new Map()
    return inMemoryCache
  }

  try {
    const raw = await fs.promises.readFile(JOBS_FILE, 'utf8')
    const list: GenerationJob[] = JSON.parse(raw)
    inMemoryCache = new Map(list.map((j) => [j.id, j]))
    return inMemoryCache
  } catch (err) {
    console.error('[JobRepository] Error reading jobs.json:', err)
    if (!inMemoryCache) inMemoryCache = new Map()
    return inMemoryCache
  }
}

async function flushToDisk(map: Map<string, GenerationJob>): Promise<void> {
  ensureDir()
  const list = Array.from(map.values())
  const json = JSON.stringify(list, null, 2)
  const temporary = path.join(STORAGE_DIR, `jobs.${process.pid}.${randomUUID()}.tmp`)
  try {
    await fs.promises.writeFile(temporary, json, 'utf8')
    await fs.promises.rename(temporary, JOBS_FILE)
  } finally { await fs.promises.unlink(temporary).catch(() => {}) }
}

async function mutateJobs<T>(edit: (map: Map<string, GenerationJob>) => T): Promise<T> {
  ensureDir()
  const deadline = Date.now() + 10000
  let lock: Awaited<ReturnType<typeof fs.promises.open>> | undefined
  while (!lock) {
    try {
      lock = await fs.promises.open(JOBS_LOCK_FILE, 'wx')
      await lock.writeFile(String(process.pid))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        if (lock) { await lock.close(); await fs.promises.unlink(JOBS_LOCK_FILE).catch(() => {}) }
        throw error
      }
      if (Date.now() >= deadline) throw new Error('Generation job storage is locked. Retry after the writer finishes; after a crash, verify the PID in .storage/generation/jobs.lock before removing that stale lock.')
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
  try {
    const map = await loadFromDisk(), result = edit(map)
    await flushToDisk(map)
    return result
  } finally {
    await lock.close()
    await fs.promises.unlink(JOBS_LOCK_FILE)
  }
}

export class JobRepository {
  static async listJobs(): Promise<GenerationJob[]> {
    const map = await loadFromDisk()
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  static async getJob(id: string): Promise<GenerationJob | null> {
    const map = await loadFromDisk()
    return map.get(id) || null
  }

  static async saveJob(job: GenerationJob): Promise<GenerationJob> {
    return mutateJobs(map => {
    const updated = {
      ...job,
      updatedAt: new Date().toISOString(),
    }
    map.set(job.id, updated)
    return updated
    })
  }

  static async updateJob(
    id: string,
    updates: Partial<GenerationJob>
  ): Promise<GenerationJob | null> {
    return mutateJobs(map => {
    const existing = map.get(id)
    if (!existing) return null

    const updated: GenerationJob = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    map.set(id, updated)
    return updated
    })
  }

  static async deleteJob(id: string): Promise<boolean> {
    return mutateJobs(map => {
    if (!map.has(id)) return false
    map.delete(id)
    return true
    })
  }
}
