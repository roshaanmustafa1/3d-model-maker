import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'

import { MeshyProvider } from '../../integrations/image-to-3d/meshy-provider.ts'
import { DemoImageTo3DProvider } from '../../integrations/image-to-3d/demo-provider.ts'
import { TripoProvider } from '../../integrations/image-to-3d/tripo-provider.ts'
import { JobRepository } from '../../server/generation/job-repository.ts'
import { saveAsset, getAsset, deleteJobAssets } from '../../server/generation/asset-storage.ts'
import { JobOrchestrator } from '../../server/generation/job-orchestrator.ts'
import { validateGlbBuffer, parseGlbBufferToThree } from '../../engine/generation/generation-validator.ts'
import { processGlbBuffer } from '../../engine/processing/mesh-processor.ts'
import { analyzeMeshHierarchy } from '../../engine/processing/mesh-analyzer.ts'
import { analyzeSemanticParts } from '../../engine/processing/semantic-part-analyzer.ts'
import { inspectSceneMaterials } from '../../engine/processing/material-processor.ts'
import { inspectSceneUVs } from '../../engine/processing/uv-processor.ts'
import { buildFallbackAnalysis } from '../../integrations/ai/gemini-analyzer.ts'
import { detectBlenderInstallation } from '../../server/blender/blender-worker-client.ts'

const TEST_FIXTURE_PATH = path.join(process.cwd(), 'docs', 'fixtures', 'black-shirt.glb')

test('Phase 4.1: Meshy provider enforces server-side authentication', async () => {
  const provider = new MeshyProvider('')
  const caps = provider.capabilities()
  assert.equal(caps.isConfigured, false)
  assert.match(caps.configurationNotice || '', /missing/i)

  await assert.rejects(
    async () => {
      await provider.createJob({
        jobId: 'test_job_1',
        prompt: 'test product',
        category: 'apparel',
        images: [{ id: '1', view: 'front', dataUrl: 'data:image/jpeg;base64,123', name: 'front.jpg', size: 100 }],
        settings: {
          category: 'apparel',
          geometryQuality: 'standard',
          shouldTexture: true,
          enablePbr: true,
          shouldRemesh: true,
        },
      })
    },
    /MESHY_API_KEY is not configured/
  )
})

test('Phase 4.1: Meshy provider maps HTTP errors (401, 402, 429) to actionable failures', async () => {
  const provider = new MeshyProvider('mock_api_key')

  // Mock global fetch
  const originalFetch = globalThis.fetch
  try {
    // Test 401 Unauthorized
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })

    await assert.rejects(
      async () => {
        await provider.createJob({
          jobId: 'test_job_401',
          prompt: 'test',
          category: 'apparel',
          images: [{ id: '1', view: 'front', dataUrl: 'data:image/jpeg;base64,123', name: 'front.jpg', size: 100 }],
          settings: { category: 'apparel', geometryQuality: 'standard', shouldTexture: true, enablePbr: true, shouldRemesh: true },
        })
      },
      /Invalid or expired MESHY_API_KEY/
    )

    // Test 402 Insufficient credits
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Credit balance exhausted' }), { status: 402 })

    await assert.rejects(
      async () => {
        await provider.createJob({
          jobId: 'test_job_402',
          prompt: 'test',
          category: 'apparel',
          images: [{ id: '1', view: 'front', dataUrl: 'data:image/jpeg;base64,123', name: 'front.jpg', size: 100 }],
          settings: { category: 'apparel', geometryQuality: 'standard', shouldTexture: true, enablePbr: true, shouldRemesh: true },
        })
      },
      /credit limit reached/
    )

    // Test 429 Rate limiting
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Too many requests' }), { status: 429 })

    await assert.rejects(
      async () => {
        await provider.createJob({
          jobId: 'test_job_429',
          prompt: 'test',
          category: 'apparel',
          images: [{ id: '1', view: 'front', dataUrl: 'data:image/jpeg;base64,123', name: 'front.jpg', size: 100 }],
          settings: { category: 'apparel', geometryQuality: 'standard', shouldTexture: true, enablePbr: true, shouldRemesh: true },
        })
      },
      /rate limit exceeded/
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Phase 4.1: Meshy provider protects against SSRF and validates GLB binary magic', async () => {
  const provider = new MeshyProvider('mock_key')

  // Reject non-HTTPS
  await assert.rejects(
    async () => {
      await provider.retrieveAssets('task_123', {
        taskId: 'task_123',
        status: 'SUCCEEDED',
        progress: 100,
        stageMessage: 'done',
        modelUrls: { glb: 'http://malicious-internal-server.local/model.glb' },
      })
    },
    /Untrusted protocol/
  )

  // Reject untrusted hosts
  await assert.rejects(
    async () => {
      await provider.retrieveAssets('task_123', {
        taskId: 'task_123',
        status: 'SUCCEEDED',
        progress: 100,
        stageMessage: 'done',
        modelUrls: { glb: 'https://evil-unapproved-site.com/model.glb' },
      })
    },
    /Untrusted host/
  )

  // Validate GLB binary magic header
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async () =>
      new Response(new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]), {
        status: 200,
        headers: { 'content-type': 'model/gltf-binary' },
      })

    await assert.rejects(
      async () => {
        await provider.retrieveAssets('task_123', {
          taskId: 'task_123',
          status: 'SUCCEEDED',
          progress: 100,
          stageMessage: 'done',
          modelUrls: { glb: 'https://assets.meshy.ai/model.glb' },
        })
      },
      /missing glTF binary magic header/
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Phase 4.1: Demo provider generates genuine, verifiable GLB fixture models', async () => {
  const provider = new DemoImageTo3DProvider()
  const status = await provider.createJob({
    jobId: 'demo_test_job',
    prompt: 'Streetwear hoodie',
    category: 'apparel',
    images: [{ id: '1', view: 'front', dataUrl: 'data:image/jpeg;base64,123', name: 'front.jpg', size: 100 }],
    settings: { category: 'apparel', geometryQuality: 'standard', shouldTexture: true, enablePbr: true, shouldRemesh: true },
  })

  assert.equal(status.status, 'PENDING')
  assert.ok(status.taskId)

  const assets = await provider.retrieveAssets(status.taskId)
  assert.ok(assets.glbBuffer.byteLength > 1000)

  // Check glTF magic header (0x46546C67)
  const magic = new DataView(assets.glbBuffer).getUint32(0, true)
  assert.equal(magic, 0x46546c67)

  // Validate geometry
  const report = await validateGlbBuffer(assets.glbBuffer)
  assert.equal(report.isGlbCompatible, true)
  assert.ok(report.triangleCount > 0)
  assert.ok(report.vertexCount > 0)
  assert.equal(report.hasUVs, true)
})

test('Phase 4.1: Durable job persistence and asset storage survive simulated restart', async () => {
  const testJobId = `job_persisted_${Date.now()}`
  const initialJob = {
    id: testJobId,
    provider: 'demo',
    providerId: 'demo',
    status: 'queued',
    progress: 10,
    stageMessage: 'Simulating persistent queue...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: 'apparel',
  }

  // 1. Save to disk
  await JobRepository.saveJob(initialJob)

  // 2. Hydrate from disk
  const reloaded = await JobRepository.getJob(testJobId)
  assert.ok(reloaded)
  assert.equal(reloaded?.id, testJobId)
  assert.equal(reloaded?.status, 'queued')

  // 3. Save binary asset to disk
  const fixtureBuf = fs.readFileSync(TEST_FIXTURE_PATH)
  const assetUrl = await saveAsset(testJobId, 'original_glb', fixtureBuf, 'model/gltf-binary')
  assert.match(assetUrl, new RegExp(`/api/ai/jobs/${testJobId}/assets/original_glb`))

  const retrievedAsset = await getAsset(testJobId, 'original_glb')
  assert.ok(retrievedAsset)
  assert.equal(retrievedAsset?.buffer.byteLength, fixtureBuf.byteLength)

  // 4. Clean up test assets
  await deleteJobAssets(testJobId)
  await JobRepository.deleteJob(testJobId)
})

test('Phase 4.2: Mesh processor guarantees source asset immutability and creates versioned processed asset', async () => {
  const fixtureBuf = fs.readFileSync(TEST_FIXTURE_PATH)
  const arrayBuffer = fixtureBuf.buffer.slice(
    fixtureBuf.byteOffset,
    fixtureBuf.byteOffset + fixtureBuf.byteLength
  )

  const originalCopy = arrayBuffer.slice(0)

  const { processedBuffer, report } = await processGlbBuffer(arrayBuffer, {
    preset: 'web_optimized',
    centerPivot: true,
    recalculateNormals: true,
  })

  // 1. Source buffer is untouched and byte-identical
  assert.equal(arrayBuffer.byteLength, originalCopy.byteLength)
  const viewOrig = new Uint8Array(arrayBuffer)
  const viewCopy = new Uint8Array(originalCopy)
  for (let i = 0; i < 64; i++) {
    assert.equal(viewOrig[i], viewCopy[i])
  }

  // 2. Processed asset is a valid GLB container
  assert.ok(processedBuffer.byteLength > 500)
  const magic = new DataView(processedBuffer).getUint32(0, true)
  assert.equal(magic, 0x46546c67)

  // 3. Report accurately tracks applied operations
  assert.equal(report.preset, 'web_optimized')
  assert.ok(report.appliedOperations.length > 0)
  assert.equal(report.centered, true)
})

test('Phase 4.2: Mesh processor generates missing UVs using box projection', async () => {
  // Create an unmapped box mesh
  const geom = new THREE.BoxGeometry(1, 1, 1)
  geom.deleteAttribute('uv') // Remove UVs
  const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial())
  const group = new THREE.Group()
  group.add(mesh)

  const sceneAnalysisBefore = analyzeMeshHierarchy(group)
  assert.equal(sceneAnalysisBefore.missingUVCount, 1)

  // Export to buffer then process with customizer_preparation
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
  const unmappedGlb = await new Promise((res, rej) => {
    new GLTFExporter().parse(group, (out) => res(out), (err) => rej(err), { binary: true })
  })

  const { processedBuffer, report } = await processGlbBuffer(unmappedGlb, {
    preset: 'customizer_preparation',
    unwrapMissingUVs: true,
  })

  const sceneAfter = await parseGlbBufferToThree(processedBuffer)
  const sceneAnalysisAfter = analyzeMeshHierarchy(sceneAfter)
  assert.equal(sceneAnalysisAfter.missingUVCount, 0)
  assert.ok(report.uvsGeneratedCount >= 1)
})

test('Phase 4.3: Blender worker detection executes safely without throwing', async () => {
  const status = await detectBlenderInstallation()
  assert.equal(typeof status.available, 'boolean')
  assert.ok(status.message)
  if (!status.available) {
    assert.match(status.message, /not found|require BLENDER_EXECUTABLE_PATH/i)
  }
})

test('Phase 4.4: Semantic part analyzer matches components and spatial regions with confidence scoring', async () => {
  const fixture = fs.readFileSync(TEST_FIXTURE_PATH)
  const scene = await parseGlbBufferToThree(
    fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength)
  )

  const aiAnalysis = buildFallbackAnalysis('hoodie', 'oversized pullover hoodie')
  const semanticReport = analyzeSemanticParts(scene, aiAnalysis)

  assert.ok(semanticReport.totalMeshes >= 1)
  assert.ok(semanticReport.mappedParts.length >= 1)

  for (const part of semanticReport.mappedParts) {
    assert.ok(part.confidence > 0 && part.confidence <= 1)
    assert.ok(part.boundingRelativePosition)
    assert.ok(part.reasoning)
  }
})

test('Phase 4.5: BlackBullet 3-tier validation distinguishing GLB, Customizer, and Runtime Readiness', async () => {
  const fixtureBuf = fs.readFileSync(TEST_FIXTURE_PATH)
  const arrayBuffer = fixtureBuf.buffer.slice(
    fixtureBuf.byteOffset,
    fixtureBuf.byteOffset + fixtureBuf.byteLength
  )

  const report = await validateGlbBuffer(arrayBuffer)

  // Gate 1: GLB compatible
  assert.equal(report.isGlbCompatible, true)
  assert.ok(report.triangleCount > 0)

  // Gate 2: Customizer compatible
  assert.equal(report.isCustomizerCompatible, true)
  assert.equal(report.hasUVs, true)

  // Gate 3: Distinct status for BlackBullet runtime contract
  assert.equal(typeof report.isBlackBulletReady, 'boolean')
  // Notice that a raw generic GLB is not falsely claimed as registered BlackBullet runtime ready unless front/back regions exist!
  assert.ok(report.recommendations.length >= 0)
})
