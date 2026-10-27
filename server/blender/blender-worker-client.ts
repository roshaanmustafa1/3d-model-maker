import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface BlenderStatus {
  available: boolean
  executablePath?: string
  version?: string
  message: string
}

export interface BlenderProcessOptions {
  recalculateNormals?: boolean
  smartUvUnwrap?: boolean
  onlyMissingUVs?: boolean
  packIslands?: boolean
  decimateRatio?: number
  exportMaterials?: boolean
}

export interface BlenderProcessResult {
  success: boolean
  processedGlbBuffer?: ArrayBuffer
  stdout?: string
  stderr?: string
  error?: string
  report?: {
    meshCount: number
    triangles: number
    uvsUnwrapped: boolean
    normalsRecalculated: boolean
  }
}

const COMMON_WINDOWS_PATHS = [
  'C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender\\blender.exe',
]

export async function detectBlenderInstallation(): Promise<BlenderStatus> {
  const configuredPath = process.env.BLENDER_EXECUTABLE_PATH

  const candidates: string[] = []
  if (configuredPath) {
    candidates.push(configuredPath)
  }
  candidates.push('blender') // In PATH
  candidates.push(...COMMON_WINDOWS_PATHS)

  for (const candidate of candidates) {
    try {
      if (candidate !== 'blender' && !fs.existsSync(candidate)) {
        continue
      }

      const { stdout } = await execFileAsync(candidate, ['--version'], {
        timeout: 4000,
        windowsHide: true,
      })

      const firstLine = stdout.split('\n')[0] || 'Blender'
      return {
        available: true,
        executablePath: candidate,
        version: firstLine.trim(),
        message: `Blender is available (${firstLine.trim()}) at ${candidate}`,
      }
    } catch {
      // Continue checking next candidate
    }
  }

  return {
    available: false,
    message:
      'Blender executable not found. Advanced Blender UV smart unwrapping & headless packing require BLENDER_EXECUTABLE_PATH to be configured in .env.local.',
  }
}

export async function executeBlenderJob(
  inputGlbBuffer: ArrayBuffer,
  options: BlenderProcessOptions = {}
): Promise<BlenderProcessResult> {
  const status = await detectBlenderInstallation()
  if (!status.available || !status.executablePath) {
    return {
      success: false,
      error: status.message,
    }
  }

  const tempDir = path.join(process.cwd(), '.storage', 'blender_jobs', `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
  await fs.promises.mkdir(tempDir, { recursive: true })

  const inputPath = path.join(tempDir, 'input.glb')
  const outputPath = path.join(tempDir, 'output.glb')
  const scriptPath = path.join(tempDir, 'worker.py')

  try {
    await fs.promises.writeFile(inputPath, Buffer.from(inputGlbBuffer))

    // Dedicated standalone Python script for Blender
    const pythonScript = `
import bpy
import bmesh
import math
import sys
import json

# Clear default scene objects
bpy.ops.wm.read_factory_settings(use_empty=True)

input_path = r"${inputPath.replace(/\\/g, '\\\\')}"
output_path = r"${outputPath.replace(/\\/g, '\\\\')}"

# Import GLB
bpy.ops.import_scene.gltf(filepath=input_path)

mesh_count = 0
total_tris = 0
normals_fixed = False
uvs_unwrapped = False

for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        bpy.ops.object.select_all(action='DESELECT')
        mesh_count += 1
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Switch to edit mode for mesh operations
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Recalculate normals outside
        ${options.recalculateNormals !== false ? 'bm = bmesh.from_edit_mesh(obj.data); bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces)); bmesh.update_edit_mesh(obj.data); normals_fixed = True' : ''}
        
        # Smart UV Unwrap
        ${options.smartUvUnwrap ? `if ${options.onlyMissingUVs ? 'len(obj.data.uv_layers) == 0' : 'True'}:
            bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
            bpy.ops.uv.pack_islands(margin=0.02)
            uvs_unwrapped = True` : ''}
        ${options.packIslands && !options.smartUvUnwrap ? 'bpy.ops.uv.select_all(action="SELECT"); bpy.ops.uv.pack_islands(margin=0.02)' : ''}
        
        bpy.ops.object.mode_set(mode='OBJECT')
        obj.data.calc_loop_triangles()
        total_tris += len(obj.data.loop_triangles)
        obj.select_set(False)

# Export processed GLB
bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')

print("BLENDER_JOB_SUCCESS:" + json.dumps({
    "meshCount": mesh_count,
    "triangles": total_tris,
    "uvsUnwrapped": uvs_unwrapped,
    "normalsRecalculated": normals_fixed
}))
`
    await fs.promises.writeFile(scriptPath, pythonScript, 'utf8')

    const { stdout, stderr } = await execFileAsync(
      status.executablePath,
      ['--background', '--python', scriptPath],
      {
        timeout: 30000,
        windowsHide: true,
      }
    )

    if (!fs.existsSync(outputPath)) {
      return {
        success: false,
        stdout,
        stderr,
        error: 'Blender process finished but did not produce output GLB.',
      }
    }

    const outputBuffer = await fs.promises.readFile(outputPath)
    const arrayBuffer = outputBuffer.buffer.slice(
      outputBuffer.byteOffset,
      outputBuffer.byteOffset + outputBuffer.byteLength
    ) as ArrayBuffer

    // Extract report from stdout if available
    let report: any
    const match = stdout.match(/BLENDER_JOB_SUCCESS:(.*)/)
    if (match) {
      try {
        report = JSON.parse(match[1])
      } catch {
        // ignore JSON parse
      }
    }

    return {
      success: true,
      processedGlbBuffer: arrayBuffer,
      stdout,
      stderr,
      report,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    // Clean up temporary directory safely
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    } catch {
      // ignore cleanup errors
    }
  }
}
