import * as THREE from 'three'
import {
  GenerationInput,
  GenerationJob,
  ImageTo3DProvider,
  GeminiAnalysisResult,
} from '@/types/ai-generator'
import { SceneNode, MaterialData } from '@/types/scene'
import { registerCustomGeometry, calculateGeometryStats } from '@/engine/scene/primitive-factory'

export class DemoImageTo3DProvider implements ImageTo3DProvider {
  private jobs = new Map<string, GenerationJob>()

  async generate(input: GenerationInput): Promise<GenerationJob> {
    const id = `job_${Date.now()}`
    const job: GenerationJob = {
      id,
      provider: 'demo',
      status: 'queued',
      progress: 5,
      stageMessage: 'Initializing AI 3D Reconstruction Pipeline...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.jobs.set(id, job)
    this.simulatePipeline(id, input)
    return job
  }

  async getJobStatus(jobId: string): Promise<GenerationJob> {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)
    return job
  }

  private async simulatePipeline(jobId: string, input: GenerationInput) {
    const job = this.jobs.get(jobId)
    if (!job) return

    // Stage 1: Analysis
    await new Promise((r) => setTimeout(r, 800))
    job.status = 'analyzing'
    job.progress = 25
    job.stageMessage = 'Analyzing reference geometry & symmetry...'
    this.jobs.set(jobId, { ...job })

    // Stage 2: Reconstructing
    await new Promise((r) => setTimeout(r, 1200))
    job.status = 'reconstructing'
    job.progress = 60
    job.stageMessage = 'Synthesizing volumetric point cloud and surface contours...'
    this.jobs.set(jobId, { ...job })

    // Stage 3: Meshing
    await new Promise((r) => setTimeout(r, 1000))
    job.status = 'meshing'
    job.progress = 85
    job.stageMessage = 'Calculating UV unwrap and PBR material separation...'
    this.jobs.set(jobId, { ...job })

    // Stage 4: Completed
    await new Promise((r) => setTimeout(r, 600))
    job.status = 'completed'
    job.progress = 100
    job.stageMessage = '3D Reconstruction Complete. Ready for Studio Ingestion.'
    this.jobs.set(jobId, { ...job })
  }
}

/**
 * Creates genuine multi-part 3D apparel/hardgoods geometry for demo generation
 */
export function buildProceduralReconstruction(category: string): {
  nodes: Record<string, SceneNode>
  rootNodeIds: string[]
  materials: Record<string, MaterialData>
  modelName: string
} {
  const nodes: Record<string, SceneNode> = {}
  const rootNodeIds: string[] = []
  const materials: Record<string, MaterialData> = {}

  // Material 1: Body Cotton
  const bodyMatId = 'mat_apparel_body'
  materials[bodyMatId] = {
    id: bodyMatId,
    name: 'Heavyweight Cotton Fleece',
    color: '#262a33',
    roughness: 0.92,
    metalness: 0.05,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  }

  // Material 2: Ribbed Trim / Cuffs
  const trimMatId = 'mat_apparel_trim'
  materials[trimMatId] = {
    id: trimMatId,
    name: 'Ribbed Knit Trim',
    color: '#1a1d24',
    roughness: 0.96,
    metalness: 0.02,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  }

  const rootId = 'node_hoodie_root'
  rootNodeIds.push(rootId)

  // Root Group
  nodes[rootId] = {
    id: rootId,
    name: 'HoodieRoot',
    type: 'group',
    parentId: null,
    children: [],
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    visible: true,
    locked: false,
    semanticTag: 'HoodieRoot',
  }

  // Helper to create box/cylinder parts with real UVs
  function addPart(
    id: string,
    name: string,
    geomType: 'box' | 'cylinder',
    params: Record<string, number>,
    position: [number, number, number],
    rotation: [number, number, number],
    materialId: string,
    customizableZone?: any
  ) {
    let geom: THREE.BufferGeometry
    if (geomType === 'box') {
      geom = new THREE.BoxGeometry(params.w, params.h, params.d, 12, 12, 12)
    } else {
      geom = new THREE.CylinderGeometry(params.rt, params.rb, params.h, 24)
    }
    geom.computeVertexNormals()

    const key = `custom_${id}`
    registerCustomGeometry(key, geom)
    const stats = calculateGeometryStats(geom)

    nodes[id] = {
      id,
      name,
      type: 'mesh',
      parentId: rootId,
      children: [],
      transform: {
        position,
        rotation,
        scale: [1, 1, 1],
      },
      geometry: {
        type: 'custom',
        params,
        stats,
        customGeometryKey: key,
      },
      materialId,
      visible: true,
      locked: false,
      isCustomizable: !!customizableZone,
      customizableZone,
      semanticTag: name,
    }
    nodes[rootId].children.push(id)
  }

  // 1. Body Main (Torso)
  addPart(
    'mesh_body_main',
    'Body_Main',
    'box',
    { w: 1.4, h: 1.8, d: 0.8 },
    [0, 1.2, 0],
    [0, 0, 0],
    bodyMatId,
    'body_front'
  )

  // 2. Sleeve Left
  addPart(
    'mesh_sleeve_left',
    'Sleeve_Left',
    'cylinder',
    { rt: 0.28, rb: 0.22, h: 1.5 },
    [-0.95, 1.1, 0],
    [0, 0, 25],
    bodyMatId,
    'sleeve_left'
  )

  // 3. Sleeve Right
  addPart(
    'mesh_sleeve_right',
    'Sleeve_Right',
    'cylinder',
    { rt: 0.28, rb: 0.22, h: 1.5 },
    [0.95, 1.1, 0],
    [0, 0, -25],
    bodyMatId,
    'sleeve_right'
  )

  // 4. Hood
  addPart(
    'mesh_hood',
    'Hood',
    'box',
    { w: 0.8, h: 0.9, d: 0.85 },
    [0, 2.4, -0.1],
    [0, 0, 0],
    bodyMatId,
    'hood'
  )

  // 5. Kangaroo Pocket Front
  addPart(
    'mesh_pocket_front',
    'Pocket_Front',
    'box',
    { w: 0.85, h: 0.55, d: 0.15 },
    [0, 0.75, 0.45],
    [0, 0, 0],
    trimMatId,
    'pocket_front'
  )

  // 6. Waistband Cuff
  addPart(
    'mesh_waist_cuff',
    'Cuff_Bottom',
    'box',
    { w: 1.35, h: 0.25, d: 0.78 },
    [0, 0.2, 0],
    [0, 0, 0],
    trimMatId
  )

  return {
    nodes,
    rootNodeIds,
    materials,
    modelName: 'AI_Reconstructed_Hoodie',
  }
}
